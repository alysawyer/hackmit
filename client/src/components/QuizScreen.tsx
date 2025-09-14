
import React, { useEffect } from 'react';
import { Mic, Square, SkipForward, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Progress } from './ui/progress';
import { useGameStore } from '../stores/gameStore';
import { useTimer } from '../hooks/useTimer';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export function QuizScreen() {
  const questions = useGameStore(state => state.questions);
  const currentQuestionIndex = useGameStore(state => state.currentQuestionIndex);
  const timerState = useGameStore(state => state.timerState);
  const timeRemaining = useGameStore(state => state.timeRemaining);
  const userAnswer = useGameStore(state => state.userAnswer);
  const answerStartTime = useGameStore(state => state.answerStartTime);
  const respondingStarted = useGameStore(state => state.respondingStarted);
  const speechDetected = useGameStore(state => state.speechDetected);
  const isRecording = useGameStore(state => state.isRecording);
  const currentQuestion = useGameStore(state => state.currentQuestion);
  const setTimerState = useGameStore(state => state.setTimerState);
  const setRespondingStarted = useGameStore(state => state.setRespondingStarted);
  const setSpeechDetected = useGameStore(state => state.setSpeechDetected);
  const setUserAnswer = useGameStore(state => state.setUserAnswer);
  const addTranscriptEntry = useGameStore(state => state.addTranscriptEntry);
  const nextQuestion = useGameStore(state => state.nextQuestion);

  const { isListening, startListening, stopListening } = useSpeechRecognition();

  // Timer logic: only 30s to answer after user hits start
  const { startResponding } = useTimer({
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

  // Reset state for every question
  useEffect(() => {
    setRespondingStarted(false);
    setSpeechDetected(false);
    setUserAnswer('');
  }, [currentQuestionIndex, questions.length]);

  const handleMicClick = () => {
    if (timerState !== 'ANSWERING_ACTIVE' && !respondingStarted) {
      setSpeechDetected(false);
      setUserAnswer('');
      startResponding();
      startListening();
    } else if (timerState === 'ANSWERING_ACTIVE' && respondingStarted) {
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
    if (timerState === 'IDLE' || timerState === 'THINKING') {
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
    if (timerState !== 'ANSWERING_ACTIVE') {
      return 'Tap the mic to start answering. You have 30 seconds.';
    }
    if (isListening || isRecording) {
      return 'Listening... Speak your answer clearly.';
    } else {
      return 'Tap the mic to start recording your answer.';
    }
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
            <div className="flex items-center gap-2 text-2xl font-bold text-muted-foreground">
              {Math.ceil(timeRemaining / 1000)}
              <span className="ml-1 text-base font-medium">sec</span>
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
            <p className="text-sm font-medium text-muted-foreground">
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

          {/* No speech start warning needed in simplified mode */}
        </CardContent>
      </Card>
    </div>
  );
}
