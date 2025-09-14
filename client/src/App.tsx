import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { MaterialInput } from './components/MaterialInput';
import { QuizScreen } from './components/QuizScreen';
import { SpeechDebugScreen } from './components/SpeechDebugScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { useGameStore } from './stores/gameStore';
import { Difficulty } from '../../shared/types';

type AppState = 'landing' | 'input' | 'speech-debug' | 'quiz' | 'results' | 'feedback';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  const { 
    setQuestions, 
    resetGame, 
    isGameComplete, 
    setShowFeedback 
  } = useGameStore();

  const handleMaterialSubmit = async (material: string, difficulty: Difficulty) => {
    setIsGeneratingQuestions(true);
    
    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: material,
          difficulty,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if ('error' in result) {
          alert(`Error generating questions: ${result.error}`);
          return;
        }

  setQuestions(result.questions);
  setAppState('speech-debug');
      } else {
        const error = await response.json();
        alert(`Failed to generate questions: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Failed to generate questions. Please check your connection and try again.');
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleStartQuiz = () => {
    setAppState('input');
  };

  const handleRestart = () => {
    resetGame();
    setAppState('input');
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
    setAppState('feedback');
  };

  const handleBackToResults = () => {
    setShowFeedback(false);
    setAppState('results');
  };

  // Auto-transition to results when game completes
  React.useEffect(() => {
    if (isGameComplete && appState === 'quiz') {
      setAppState('results');
    }
  }, [isGameComplete, appState]);

  return (
    <div className="min-h-screen bg-gray-50">
      {appState === 'landing' && (
        <LandingPage onStartQuiz={handleStartQuiz} />
      )}
      
      {appState === 'input' && (
        <MaterialInput 
          onSubmit={handleMaterialSubmit}
          isLoading={isGeneratingQuestions}
        />
      )}
      
      {appState === 'speech-debug' && (
        <SpeechDebugScreen onContinue={() => setAppState('quiz')} />
      )}
      {appState === 'quiz' && <QuizScreen />}
      
      {appState === 'results' && (
        <ResultsScreen 
          onRestart={handleRestart}
          onViewFeedback={handleViewFeedback}
        />
      )}
      
      {appState === 'feedback' && (
        <FeedbackScreen 
          onBack={handleBackToResults}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

export default App;
