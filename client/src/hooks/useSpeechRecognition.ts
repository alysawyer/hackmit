import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../stores/gameStore';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  addEventListener(type: 'result', listener: (event: SpeechRecognitionEvent) => void): void;
  addEventListener(type: 'error', listener: (event: SpeechRecognitionErrorEvent) => void): void;
  addEventListener(type: 'start', listener: () => void): void;
  addEventListener(type: 'end', listener: () => void): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { 
    setUserAnswer, 
    setHasStartedSpeaking, 
    timerState,
    setIsRecording 
  } = useGameStore();

  useEffect(() => {
    // Check for browser speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy

      recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        let confidence = 0;

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result) continue;
          
          // Use the best alternative with highest confidence
          let bestTranscript = '';
          let bestConfidence = 0;
          
          for (let j = 0; j < result.length; j++) {
            const alternative = result[j];
            if (alternative && alternative.confidence > bestConfidence) {
              bestTranscript = alternative.transcript;
              bestConfidence = alternative.confidence;
            }
          }
          
          if (!bestTranscript && result[0]) {
            bestTranscript = result[0].transcript || '';
          }
          
          if (result.isFinal) {
            finalTranscript += bestTranscript + ' ';
            confidence = Math.max(confidence, bestConfidence);
          } else {
            interimTranscript += bestTranscript + ' ';
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).trim();
        
        if (fullTranscript && !useGameStore.getState().hasStartedSpeaking) {
          setHasStartedSpeaking(true);
        }
        
        // Clean up the transcript for better accuracy
        const cleanedTranscript = fullTranscript
          .replace(/\s+/g, ' ')  // Remove extra spaces
          .replace(/\b(uh|um|er|ah)\b/gi, '')  // Remove filler words
          .trim();
        
        setUserAnswer(cleanedTranscript);
        
        // Log confidence for debugging
        if (confidence > 0) {
          console.log('Speech confidence:', confidence);
        }
      });

      recognition.addEventListener('start', () => {
        setIsListening(true);
      });

      recognition.addEventListener('end', () => {
        setIsListening(false);
      });

      recognition.addEventListener('error', (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Auto-restart on certain errors
        if (event.error === 'network' || event.error === 'aborted') {
          setTimeout(() => {
            if (timerState === 'ANSWERING_ACTIVE') {
              startListening();
            }
          }, 1000);
        }
      });

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = async () => {
    if (timerState !== 'ANSWERING_ACTIVE') return;

    if (recognitionRef.current && isSupported) {
      // Use browser speech recognition
      try {
        // Stop any existing recognition first
        if (isListening) {
          recognitionRef.current.stop();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        recognitionRef.current.start();
        console.log('Speech recognition started');
      } catch (error: any) {
        console.error('Error starting speech recognition:', error);
        
        // If already started, just continue
        if (error?.message?.includes('already started')) {
          setIsListening(true);
          return;
        }
        
        // Fallback to recording
        startRecording();
      }
    } else {
      // Fallback to audio recording
      startRecording();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Send to server for transcription
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            const transcript = result.transcript?.trim() || '';
            
            if (transcript && !useGameStore.getState().hasStartedSpeaking) {
              setHasStartedSpeaking(true);
            }
            
            setUserAnswer(transcript);
          }
        } catch (error) {
          console.error('Error transcribing audio:', error);
        }

        // Clean up stream
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      });

      mediaRecorder.start();
      setIsRecording(true);
      
      // Detect speech start by monitoring audio levels
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let speechDetected = false;
      let silenceStart = Date.now();
      const SILENCE_THRESHOLD = 30; // Lower threshold for better detection
      const SILENCE_DURATION = 2000; // Stop after 2 seconds of silence
      
      const checkForSpeech = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average > SILENCE_THRESHOLD) {
          silenceStart = Date.now(); // Reset silence timer
          
          if (!speechDetected) {
            speechDetected = true;
            if (!useGameStore.getState().hasStartedSpeaking) {
              setHasStartedSpeaking(true);
              console.log('Speech detected via audio level');
            }
          }
        }
        
        // Auto-stop recording after prolonged silence
        if (speechDetected && Date.now() - silenceStart > SILENCE_DURATION) {
          console.log('Stopping recording due to silence');
          mediaRecorder.stop();
          return;
        }
        
        if (mediaRecorder.state === 'recording') {
          requestAnimationFrame(checkForSpeech);
        }
      };
      
      checkForSpeech();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
    }
  };

  return {
    isSupported,
    isListening: isListening || useGameStore.getState().isRecording,
    startListening,
    stopListening,
  };
}
