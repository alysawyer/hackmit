import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/gameStore';

const ANSWER_TIME = 30000; // 30 seconds max for answering

export function useTimer({
  onAutoStopRecording
}: {
  onAutoStopRecording?: () => void;
} = {}) {
  const frameRef = useRef<number>();
  const lastTimestampRef = useRef<number>();
  const {
    timerState,
    timeRemaining,
    answerStartTime,
  respondingStarted,
  setTimerState,
  setTimeRemaining,
  setRespondingStarted,
  setSpeechDetected,
  setUserAnswer,
  addTranscriptEntry,
  nextQuestion,
  currentQuestion
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

    let newTimeRemaining = Math.max(0, timeRemaining - deltaTime);
    setTimeRemaining(newTimeRemaining);

    // Responding State: 30s max
    if (timerState === 'ANSWERING_ACTIVE' && respondingStarted) {
      const timeSinceAnswerStart = performance.now() - (answerStartTime || 0);
      if (timeSinceAnswerStart > ANSWER_TIME) {
        if (onAutoStopRecording) onAutoStopRecording();
        handleAnswerTimeout();
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
      return;
    }
  };

  const handleAnswerTimeout = () => {
    stopTimer();
    setRespondingStarted(false);
    setSpeechDetected(false);
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
    setUserAnswer(''); // Clear transcript for next question
    setTimerState('SHOWING_RESULT');
    setTimeout(() => {
      nextQuestion();
    }, 1500);
  };


  const startTimer = () => {
    stopTimer();
    frameRef.current = requestAnimationFrame(tick);
  };

  // Only one state: Responding
  const startResponding = () => {
    stopTimer();
    setTimerState('ANSWERING_ACTIVE');
    setTimeRemaining(ANSWER_TIME);
    setRespondingStarted(true);
    setSpeechDetected(false);
    setUserAnswer(''); // Clear transcript for new answer
    useGameStore.getState().setAnswerStartTime(performance.now());
    frameRef.current = requestAnimationFrame(tick);
  };

  // Start timer when state changes to THINKING or ANSWERING_ACTIVE
  useEffect(() => {
    if (timerState === 'ANSWERING_ACTIVE' && respondingStarted) {
      startTimer();
    } else {
      stopTimer();
    }
    return () => stopTimer();
  }, [timerState, respondingStarted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  return {
    startResponding,
    stopTimer,
  };
}
