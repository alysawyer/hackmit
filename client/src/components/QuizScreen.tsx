
import React, { useEffect } from 'react';
import { Mic, Square, SkipForward, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Progress } from './ui/progress';
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

  const { isListening, startListening, stopListening } = useSpeechRecognition();

  // Timer logic with auto recording callbacks
  const { startAnswering, startThinking } = useTimer({
    onAutoStartRecording: () => {
      if (timerState === 'THINKING') {
        startAnswering();
        startListening();
      }
    },
    onAutoStopRecording: () => {
      if (timerState === 'ANSWERING_ACTIVE' && (isListening || isRecording)) {
        stopListening();
        handleSubmitAnswer();
      }
    }
  });

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

  const handleSkipQuestion = () => {
    if (!question) return;
    // Add a blank entry for skipped question
    const entry = {
      questionId: question.id,
      questionPrompt: question.prompt,
      userAnswer: '[Skipped]',
      verdict: 'INCORRECT' as const,
      briefFeedback: 'Question was skipped.',
    };

    addTranscriptEntry(entry);
    nextQuestion();
  };

  const handleSubmitAnswer = async () => {
    if (!question || !userAnswer || !userAnswer.trim()) return;

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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTimerProgress = () => {
    const maxTime = timerState === 'THINKING' ? 10000 : 30000;
    return Math.max(0, (timeRemaining / maxTime) * 100);
  };

  // getTimerColor is not used in JSX, so remove it to avoid unused error

  const getMicButtonState = () => {
    if (timerState === 'THINKING') {
      return {
        text: 'Start Recording',
        icon: Mic,
        variant: 'default' as const,
        disabled: false,
      };
    }
    if (timerState === 'ANSWERING_ACTIVE') {
      if (isListening || isRecording) {
        return {
          text: 'Stop Recording',
          icon: Square,
          variant: 'destructive' as const,
          disabled: false,
        };
      } else {
        return {
          text: 'Start Recording',
          icon: Mic,
          variant: 'default' as const,
          disabled: false,
        };
      }
    }
    return {
      text: 'Processing...',
      icon: Clock,
      variant: 'secondary' as const,
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
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl">
        <CardHeader className="pb-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-medium text-muted-foreground">
              Question {progress} of {total}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4" />
              {Math.ceil(timeRemaining / 1000)}s remaining
            </div>
          </div>

          {/* Progress Bar */}
          <Progress 
            value={getTimerProgress()} 
            className="mb-6"
            style={{
              '--progress-foreground': timerState === 'THINKING' ? 'hsl(var(--primary))' : 
                                    timerState === 'ANSWERING_ACTIVE' ? 'hsl(142 76% 36%)' : 
                                    'hsl(var(--muted))'
            } as React.CSSProperties}
          />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question */}
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground leading-tight">
              {question.prompt}
            </h2>
            
            {/* Status Message */}
            <p className={`text-sm font-medium ${
              timerState === 'ANSWERING_ACTIVE' && answerStartTime && !hasStartedSpeaking
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}>
              {getStatusMessage()}
            </p>
          </div>

          {/* User Answer Preview */}
          {userAnswer && (
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-sm font-medium text-foreground mb-2">Your answer:</p>
              <p className="text-foreground">{userAnswer}</p>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              onClick={handleMicClick}
              disabled={micButton.disabled}
              variant={micButton.variant}
              size="lg"
              className={`min-w-48 h-12 text-base ${
                (isListening || isRecording) ? 'animate-pulse' : ''
              }`}
            >
              <ButtonIcon className="w-5 h-5 mr-2" />
              {micButton.text}
            </Button>
            
            {/* Skip Button */}
            {timerState !== 'EVALUATING' && timerState !== 'SHOWING_RESULT' && (
              <Button
                onClick={handleSkipQuestion}
                variant="outline"
                size="lg"
                className="min-w-32"
              >
                <SkipForward className="w-4 h-4 mr-2" />
                Skip
              </Button>
            )}
          </div>

          {/* Recording Indicator */}
          {(isListening || isRecording) && (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-full border border-destructive/20">
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">
                  {isListening ? 'Listening...' : 'Recording...'}
                </span>
              </div>
            </div>
          )}

          {/* Speech Start Warning */}
          {timerState === 'ANSWERING_ACTIVE' && answerStartTime && !hasStartedSpeaking && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 text-center">
                ⚠️ Remember: You must begin speaking within the first 10 seconds of the answer phase!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
