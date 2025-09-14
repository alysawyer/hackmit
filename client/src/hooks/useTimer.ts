import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

const THINK_TIME = 30000; // 30 seconds
const ANSWER_TIME = 30000; // 30 seconds  
const SPEECH_START_WINDOW = 10000; // 10 seconds

export function useTimer() {
  const frameRef = useRef<number>();
  const lastTimestampRef = useRef<number>();
  const {
    timerState,
    timeRemaining,
    answerStartTime,
    hasStartedSpeaking,
    setTimerState,
    setTimeRemaining,
    addTranscriptEntry,
    nextQuestion,
    currentQuestion,
  } = useGameStore();

  const stopTimer = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
    lastTimestampRef.current = undefined;
  };

  const tick = (timestamp: number) => {
    if (!lastTimestampRef.current) {
      lastTimestampRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimestampRef.current;
    lastTimestampRef.current = timestamp;

    const newTimeRemaining = Math.max(0, timeRemaining - deltaTime);
    setTimeRemaining(newTimeRemaining);

    // Handle state transitions based on timer
    if (newTimeRemaining <= 0) {
      if (timerState === 'THINKING') {
        // Auto-start answer phase
        setTimerState('ANSWERING_ACTIVE');
        setTimeRemaining(ANSWER_TIME);
        useGameStore.getState().setAnswerStartTime(performance.now());
      } else if (timerState === 'ANSWERING_ACTIVE') {
        // Time's up for answering
        handleAnswerTimeout();
        return;
      }
    }

    // Check for speech start timeout during answering
    if (timerState === 'ANSWERING_ACTIVE' && answerStartTime) {
      const timeSinceAnswerStart = performance.now() - answerStartTime;
      if (timeSinceAnswerStart > SPEECH_START_WINDOW && !hasStartedSpeaking) {
        // Auto-fail for not speaking within 10 seconds
        handleNoSpeechFail();
        return;
      }
    }

    // Continue timer if still running
    if (newTimeRemaining > 0 && (timerState === 'THINKING' || timerState === 'ANSWERING_ACTIVE')) {
      frameRef.current = requestAnimationFrame(tick);
    }
  };

  const handleAnswerTimeout = () => {
    stopTimer();
    const question = currentQuestion();
    if (question) {
      const entry = {
        questionId: question.id,
        questionPrompt: question.prompt,
        userAnswer: useGameStore.getState().userAnswer || '',
        verdict: 'INCORRECT' as const,
        briefFeedback: 'Time expired.',
      };
      addTranscriptEntry(entry);
    }
    
    setTimerState('SHOWING_RESULT');
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const handleNoSpeechFail = () => {
    stopTimer();
    const question = currentQuestion();
    if (question) {
      const entry = {
        questionId: question.id,
        questionPrompt: question.prompt,
        userAnswer: '',
        verdict: 'INCORRECT' as const,
        briefFeedback: 'No answer detected within 10s.',
      };
      addTranscriptEntry(entry);
    }
    
    setTimerState('SHOWING_RESULT');
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };

  const startTimer = () => {
    if (timerState === 'THINKING' || timerState === 'ANSWERING_ACTIVE') {
      stopTimer();
      frameRef.current = requestAnimationFrame(tick);
    }
  };

  const startAnswering = () => {
    if (timerState === 'THINKING') {
      stopTimer();
      setTimerState('ANSWERING_ACTIVE');
      setTimeRemaining(ANSWER_TIME);
      useGameStore.getState().setAnswerStartTime(performance.now());
      frameRef.current = requestAnimationFrame(tick);
    }
  };

  const startThinking = () => {
    stopTimer();
    setTimerState('THINKING');
    setTimeRemaining(THINK_TIME);
    useGameStore.getState().setAnswerStartTime(null);
    useGameStore.getState().setHasStartedSpeaking(false);
    useGameStore.getState().setUserAnswer('');
    frameRef.current = requestAnimationFrame(tick);
  };

  // Start timer when state changes to THINKING or ANSWERING_ACTIVE
  useEffect(() => {
    if (timerState === 'THINKING' || timerState === 'ANSWERING_ACTIVE') {
      startTimer();
    } else {
      stopTimer();
    }

    return () => stopTimer();
  }, [timerState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  return {
    startAnswering,
    startThinking,
    stopTimer,
  };
}
