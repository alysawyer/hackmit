import React, { useEffect } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/solid';
import { useGameStore } from '../stores/gameStore';
import { useTimer } from '../hooks/useTimer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function QuizScreen() {
  const {
    questions,
    currentQuestionIndex,
    timerState,
    timeRemaining,
    userAnswer,
    answerStartTime,
    hasStartedSpeaking,
    isRecording,
    currentQuestion,
    setTimerState,
    addTranscriptEntry,
    nextQuestion,
  } = useGameStore();

  const { startAnswering, startThinking } = useTimer();
  const { isListening, startListening, stopListening } = useSpeechRecognition();

  const question = currentQuestion();
  const progress = currentQuestionIndex + 1;
  const total = questions.length;

  // Start first question
  useEffect(() => {
    if (questions.length > 0 && timerState === 'IDLE') {
      startThinking();
    }
  }, [questions, timerState, startThinking]);

  const handleMicClick = () => {
    if (timerState === 'THINKING') {
      startAnswering();
      startListening();
    } else if (timerState === 'ANSWERING_ACTIVE') {
      if (isListening || isRecording) {
        stopListening();
        handleSubmitAnswer();
      } else {
        startListening();
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!question || !userAnswer.trim()) return;

    setTimerState('EVALUATING');

    try {
      const response = await fetch('/api/eval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          questionPrompt: question.prompt,
          userAnswer: userAnswer.trim(),
          materialContext: question.sourceWindow,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        const entry = {
          questionId: question.id,
          questionPrompt: question.prompt,
          userAnswer: userAnswer.trim(),
          verdict: result.verdict,
          briefFeedback: result.briefFeedback,
        };

        addTranscriptEntry(entry);
        setTimerState('SHOWING_RESULT');

        // Auto-advance after showing result
        setTimeout(() => {
          nextQuestion();
        }, 1500);
      } else {
        throw new Error('Evaluation failed');
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      
      // Fallback entry
      const entry = {
        questionId: question.id,
        questionPrompt: question.prompt,
        userAnswer: userAnswer.trim(),
        verdict: 'INCORRECT' as const,
        briefFeedback: 'Evaluation failed due to technical error.',
      };

      addTranscriptEntry(entry);
      setTimerState('SHOWING_RESULT');

      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  const getTimerProgress = () => {
    const maxTime = timerState === 'THINKING' ? 30000 : 30000;
    return Math.max(0, (timeRemaining / maxTime) * 100);
  };

  const getTimerColor = () => {
    if (timerState === 'THINKING') return 'bg-blue-500';
    if (timerState === 'ANSWERING_ACTIVE') {
      if (answerStartTime && !hasStartedSpeaking) {
        const timeSinceStart = performance.now() - answerStartTime;
        return timeSinceStart > 10000 ? 'bg-red-500' : 'bg-orange-500';
      }
      return 'bg-green-500';
    }
    return 'bg-gray-400';
  };

  const getMicButtonState = () => {
    if (timerState === 'THINKING') {
      return {
        text: 'Start Answering',
        icon: MicrophoneIcon,
        className: 'btn-primary text-lg px-8 py-4',
        disabled: false,
      };
    }
    
    if (timerState === 'ANSWERING_ACTIVE') {
      if (isListening || isRecording) {
        return {
          text: 'Stop & Submit',
          icon: StopIcon,
          className: 'btn-error text-lg px-8 py-4 animate-pulse-fast',
          disabled: false,
        };
      } else {
        return {
          text: 'Start Recording',
          icon: MicrophoneIcon,
          className: 'btn-success text-lg px-8 py-4',
          disabled: false,
        };
      }
    }

    return {
      text: 'Processing...',
      icon: MicrophoneIcon,
      className: 'btn-secondary text-lg px-8 py-4',
      disabled: true,
    };
  };

  const getStatusMessage = () => {
    if (timerState === 'THINKING') {
      return 'Think about your answer. Tap the mic to start answering anytime.';
    }
    
    if (timerState === 'ANSWERING_ACTIVE') {
      if (answerStartTime && !hasStartedSpeaking) {
        const timeSinceStart = performance.now() - answerStartTime;
        const remaining = Math.max(0, 10000 - timeSinceStart);
        if (remaining > 0) {
          return `You must start speaking within ${Math.ceil(remaining / 1000)} seconds!`;
        } else {
          return 'Time to start speaking has expired!';
        }
      }
      
      if (isListening || isRecording) {
        return 'Listening... Speak your answer clearly.';
      } else {
        return 'Tap the mic to start recording your answer.';
      }
    }
    
    if (timerState === 'EVALUATING') {
      return 'Evaluating your answer...';
    }
    
    if (timerState === 'SHOWING_RESULT') {
      return 'Moving to next question...';
    }
    
    return '';
  };

  const micButton = getMicButtonState();
  const ButtonIcon = micButton.icon;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="card p-8">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm font-medium text-gray-500">
            Question {progress} of {total}
          </div>
          <div className="text-sm font-medium text-gray-500">
            {Math.ceil(timeRemaining / 1000)}s remaining
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-8">
          <div
            className={`progress-fill ${getTimerColor()}`}
            style={{ width: `${getTimerProgress()}%` }}
          />
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {question.prompt}
          </h2>
          
          {question.topic && (
            <p className="text-sm text-gray-500 mb-4">
              Topic: {question.topic}
            </p>
          )}
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          <p className={`text-sm font-medium ${
            timerState === 'ANSWERING_ACTIVE' && answerStartTime && !hasStartedSpeaking
              ? 'text-red-600'
              : 'text-gray-600'
          }`}>
            {getStatusMessage()}
          </p>
        </div>

        {/* User Answer Preview */}
        {userAnswer && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Your answer:</p>
            <p className="text-gray-900">{userAnswer}</p>
          </div>
        )}

        {/* Mic Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleMicClick}
            disabled={micButton.disabled}
            className={micButton.className}
            aria-label={micButton.text}
          >
            <ButtonIcon className="w-6 h-6 mr-2" />
            {micButton.text}
          </button>
        </div>

        {/* Recording Indicator */}
        {(isListening || isRecording) && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">
                {isListening ? 'Listening...' : 'Recording...'}
              </span>
            </div>
          </div>
        )}

        {/* Speech Start Warning */}
        {timerState === 'ANSWERING_ACTIVE' && answerStartTime && !hasStartedSpeaking && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 text-center">
              ⚠️ Remember: You must begin speaking within the first 10 seconds of the answer phase!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
