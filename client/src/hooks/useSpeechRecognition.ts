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

      recognition.addEventListener('result', (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; i++) {
          const transcript = event.results[i]?.[0]?.transcript || '';
          if (event.results[i]?.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = (finalTranscript + interimTranscript).trim();
        
        if (fullTranscript && !useGameStore.getState().hasStartedSpeaking) {
          setHasStartedSpeaking(true);
        }
        
        setUserAnswer(fullTranscript);
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
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
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
      
      const checkForSpeech = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        if (average > 50 && !speechDetected) { // Threshold for speech detection
          speechDetected = true;
          if (!useGameStore.getState().hasStartedSpeaking) {
            setHasStartedSpeaking(true);
          }
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
