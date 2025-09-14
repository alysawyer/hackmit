import { create } from 'zustand';
import { 
  QuestionItem, 
  TranscriptEntry, 
  GameSummary, 
  Difficulty, 
  Verdict 
} from '../../../shared/types';

export type TimerState = 
  | 'IDLE'
  | 'THINKING' 
  | 'ANSWERING_ACTIVE'
  | 'ANSWERING_FAIL'
  | 'EVALUATING'
  | 'SHOWING_RESULT';

export interface GameState {
  // Material and setup
  material: string;
  difficulty: Difficulty;
  
  // Questions
  questions: QuestionItem[];
  currentQuestionIndex: number;
  
  // Timer state
  timerState: TimerState;
  timeRemaining: number;
  answerStartTime: number | null;
  
  // Current question state
  userAnswer: string;
  isRecording: boolean;
  waitingStarted: boolean;
  respondingStarted: boolean;
  speechDetected: boolean;
  
  // Results
  transcript: TranscriptEntry[];
  isGameComplete: boolean;
  
  // UI state
  showFeedback: boolean;
  
  // Actions
  setMaterial: (material: string, difficulty: Difficulty) => void;
  setQuestions: (questions: QuestionItem[]) => void;
  setTimerState: (state: TimerState) => void;
  setTimeRemaining: (time: number) => void;
  setAnswerStartTime: (time: number | null) => void;
  setUserAnswer: (answer: string) => void;
  setIsRecording: (recording: boolean) => void;
  setWaitingStarted: (started: boolean) => void;
  setRespondingStarted: (started: boolean) => void;
  setSpeechDetected: (detected: boolean) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  nextQuestion: () => void;
  completeGame: () => void;
  resetGame: () => void;
  setShowFeedback: (show: boolean) => void;
  
  // Computed
  currentQuestion: () => QuestionItem | null;
  getGameSummary: () => GameSummary;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  material: '',
  difficulty: 'medium',
  questions: [],
  currentQuestionIndex: 0,
  timerState: 'IDLE',
  timeRemaining: 30000,
  answerStartTime: null,
  userAnswer: '',
  isRecording: false,
  waitingStarted: false,
  respondingStarted: false,
  speechDetected: false,
  transcript: [],
  isGameComplete: false,
  showFeedback: false,
  
  // Actions
  setMaterial: (material, difficulty) => set({ material, difficulty }),
  
  setQuestions: (questions) => set({ 
    questions, 
    currentQuestionIndex: 0,
    transcript: [],
    isGameComplete: false,
  }),
  
  setTimerState: (timerState) => set((state) => {
    if (timerState === 'ANSWERING_ACTIVE' && state.timerState !== 'ANSWERING_ACTIVE') {
      return {
        timerState,
        timeRemaining: 30000,
        answerStartTime: performance.now(),
      };
    }
    return { timerState };
  }),
  
  setTimeRemaining: (timeRemaining) => set({ timeRemaining }),
  
  setAnswerStartTime: (answerStartTime) => set({ answerStartTime }),
  
  setUserAnswer: (userAnswer) => set({ userAnswer }),
  
  setIsRecording: (isRecording) => set({ isRecording }),
  
  setWaitingStarted: (waitingStarted) => set({ waitingStarted }),
  setRespondingStarted: (respondingStarted) => set({ respondingStarted }),
  setSpeechDetected: (speechDetected) => set({ speechDetected }),
  
  addTranscriptEntry: (entry) => set((state) => ({
    transcript: [...state.transcript, entry],
  })),
  
  nextQuestion: () => set((state) => {
    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= state.questions.length) {
      return {
        isGameComplete: true,
        timerState: 'IDLE',
        userAnswer: '',
        waitingStarted: false,
        respondingStarted: false,
        speechDetected: false,
        answerStartTime: null,
      };
    }
    return {
      currentQuestionIndex: nextIndex,
      timerState: 'IDLE',
      timeRemaining: 30000,
      userAnswer: '',
      waitingStarted: false,
      respondingStarted: false,
      speechDetected: false,
      answerStartTime: null,
    };
  }),
  
  completeGame: () => set({
    isGameComplete: true,
    timerState: 'IDLE',
    userAnswer: '',
  waitingStarted: false,
  respondingStarted: false,
  speechDetected: false,
    answerStartTime: null,
  }),
  
  resetGame: () => set({
    material: '',
    difficulty: 'medium',
    questions: [],
    currentQuestionIndex: 0,
    timerState: 'IDLE',
    timeRemaining: 30000,
    answerStartTime: null,
    userAnswer: '',
    isRecording: false,
  waitingStarted: false,
  respondingStarted: false,
  speechDetected: false,
    transcript: [],
    isGameComplete: false,
    showFeedback: false,
  }),
  
  setShowFeedback: (showFeedback) => set({ showFeedback }),
  
  // Computed
  currentQuestion: () => {
    const state = get();
    return state.questions[state.currentQuestionIndex] || null;
  },
  
  getGameSummary: () => {
    const state = get();
    const correct = state.transcript.filter(entry => entry.verdict === 'CORRECT').length;
    const incorrect = state.transcript.length - correct;
    
    return {
      total: state.transcript.length,
      correct,
      incorrect,
      transcript: state.transcript,
    };
  },
}));
