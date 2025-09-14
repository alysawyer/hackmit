import React, { useEffect, useState } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useGameStore } from '../stores/gameStore';
import { Button } from './ui/button';


export function SpeechDebugScreen({ onContinue }: { onContinue: () => void }) {
  const { isListening, startListening, stopListening } = useSpeechRecognition();
  const { hasStartedSpeaking, userAnswer } = useGameStore();
  const [localTranscript, setLocalTranscript] = useState('');

  // Keep local transcript in sync with store
  useEffect(() => {
    setLocalTranscript(userAnswer);
  }, [userAnswer]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-lg bg-card rounded-lg shadow p-8 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Speech Recognition Test</h2>
        <p className="mb-2 text-muted-foreground">Speak into your microphone. You should see your words appear below in real time.</p>
        <div className="w-full bg-muted rounded p-4 mb-4 min-h-[60px] text-lg">
          {localTranscript || <span className="text-muted-foreground">(No speech detected yet)</span>}
        </div>
        <div className="mb-4">
          <span className="font-medium">hasStartedSpeaking:</span>
          <span className={hasStartedSpeaking ? 'text-green-600 font-bold ml-2' : 'text-red-600 font-bold ml-2'}>
            {hasStartedSpeaking ? 'true' : 'false'}
          </span>
        </div>
        <div className="flex gap-4 mb-4">
          <Button onClick={startListening} disabled={isListening} variant="default">Start Listening</Button>
          <Button onClick={stopListening} disabled={!isListening} variant="destructive">Stop Listening</Button>
        </div>
        <Button onClick={onContinue} variant="secondary">Continue to Quiz</Button>
      </div>
    </div>
  );
}
