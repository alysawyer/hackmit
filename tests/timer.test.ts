import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock performance.now for consistent testing
const mockPerformanceNow = vi.fn();
global.performance = { now: mockPerformanceNow } as any;

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = vi.fn();

// Simple timer state machine for testing
type TimerState = 'IDLE' | 'THINKING' | 'ANSWERING_ACTIVE' | 'ANSWERING_FAIL' | 'EVALUATING' | 'SHOWING_RESULT';

class TimerStateMachine {
  private state: TimerState = 'IDLE';
  private timeRemaining = 0;
  private answerStartTime: number | null = null;
  private hasStartedSpeaking = false;

  constructor() {}

  getState() {
    return this.state;
  }

  getTimeRemaining() {
    return this.timeRemaining;
  }

  getAnswerStartTime() {
    return this.answerStartTime;
  }

  hasStartedSpeaking() {
    return this.hasStartedSpeaking;
  }

  startThinking() {
    this.state = 'THINKING';
    this.timeRemaining = 30000; // 30 seconds
    this.answerStartTime = null;
    this.hasStartedSpeaking = false;
  }

  startAnswering() {
    if (this.state === 'THINKING') {
      this.state = 'ANSWERING_ACTIVE';
      this.timeRemaining = 30000; // 30 seconds
      this.answerStartTime = performance.now();
    }
  }

  setSpeakingStarted() {
    this.hasStartedSpeaking = true;
  }

  tick(deltaTime: number) {
    this.timeRemaining = Math.max(0, this.timeRemaining - deltaTime);

    // Handle state transitions
    if (this.timeRemaining <= 0) {
      if (this.state === 'THINKING') {
        this.startAnswering();
      } else if (this.state === 'ANSWERING_ACTIVE') {
        this.state = 'SHOWING_RESULT';
        return 'timeout';
      }
    }

    // Check for speech start timeout during answering
    if (this.state === 'ANSWERING_ACTIVE' && this.answerStartTime) {
      const timeSinceAnswerStart = performance.now() - this.answerStartTime;
      if (timeSinceAnswerStart > 10000 && !this.hasStartedSpeaking) {
        this.state = 'ANSWERING_FAIL';
        return 'no_speech_fail';
      }
    }

    return null;
  }

  reset() {
    this.state = 'IDLE';
    this.timeRemaining = 0;
    this.answerStartTime = null;
    this.hasStartedSpeaking = false;
  }
}

describe('Timer State Machine', () => {
  let timer: TimerStateMachine;

  beforeEach(() => {
    timer = new TimerStateMachine();
    vi.clearAllMocks();
    mockPerformanceNow.mockReturnValue(0);
  });

  describe('Initial State', () => {
    it('should start in IDLE state', () => {
      expect(timer.getState()).toBe('IDLE');
      expect(timer.getTimeRemaining()).toBe(0);
      expect(timer.getAnswerStartTime()).toBeNull();
      expect(timer.hasStartedSpeaking()).toBe(false);
    });
  });

  describe('Thinking Phase', () => {
    it('should transition to THINKING state with 30s timer', () => {
      timer.startThinking();
      
      expect(timer.getState()).toBe('THINKING');
      expect(timer.getTimeRemaining()).toBe(30000);
      expect(timer.getAnswerStartTime()).toBeNull();
      expect(timer.hasStartedSpeaking()).toBe(false);
    });

    it('should auto-transition to ANSWERING_ACTIVE when think time expires', () => {
      timer.startThinking();
      
      // Simulate 30 seconds passing
      const result = timer.tick(30000);
      
      expect(timer.getState()).toBe('ANSWERING_ACTIVE');
      expect(timer.getTimeRemaining()).toBe(30000); // Reset for answer phase
      expect(timer.getAnswerStartTime()).toBe(0); // performance.now() returns 0
      expect(result).toBeNull();
    });

    it('should allow manual transition to answering', () => {
      timer.startThinking();
      mockPerformanceNow.mockReturnValue(15000);
      
      timer.startAnswering();
      
      expect(timer.getState()).toBe('ANSWERING_ACTIVE');
      expect(timer.getTimeRemaining()).toBe(30000);
      expect(timer.getAnswerStartTime()).toBe(15000);
    });
  });

  describe('Answering Phase', () => {
    beforeEach(() => {
      timer.startThinking();
      mockPerformanceNow.mockReturnValue(5000);
      timer.startAnswering();
    });

    it('should timeout after 30 seconds', () => {
      const result = timer.tick(30000);
      
      expect(timer.getState()).toBe('SHOWING_RESULT');
      expect(result).toBe('timeout');
    });

    it('should fail if no speech detected within 10 seconds', () => {
      // Simulate 10.1 seconds passing since answer start
      mockPerformanceNow.mockReturnValue(15100);
      
      const result = timer.tick(100);
      
      expect(timer.getState()).toBe('ANSWERING_FAIL');
      expect(result).toBe('no_speech_fail');
    });

    it('should not fail if speech is detected within 10 seconds', () => {
      // Simulate 5 seconds passing
      mockPerformanceNow.mockReturnValue(10000);
      timer.setSpeakingStarted();
      
      // Then 6 more seconds (11 total since start)
      mockPerformanceNow.mockReturnValue(16000);
      const result = timer.tick(1000);
      
      expect(timer.getState()).toBe('ANSWERING_ACTIVE');
      expect(result).toBeNull();
    });

    it('should continue normally after speech is detected', () => {
      // Start speaking after 3 seconds
      mockPerformanceNow.mockReturnValue(8000);
      timer.setSpeakingStarted();
      
      // Continue for another 27 seconds (30 total)
      mockPerformanceNow.mockReturnValue(35000);
      const result = timer.tick(27000);
      
      expect(timer.getState()).toBe('SHOWING_RESULT');
      expect(result).toBe('timeout');
    });
  });

  describe('State Transitions', () => {
    it('should only allow answering from thinking state', () => {
      timer.startAnswering(); // Try to start answering from IDLE
      expect(timer.getState()).toBe('IDLE');
      
      timer.startThinking();
      timer.startAnswering();
      expect(timer.getState()).toBe('ANSWERING_ACTIVE');
    });

    it('should reset all state properly', () => {
      timer.startThinking();
      timer.startAnswering();
      timer.setSpeakingStarted();
      
      timer.reset();
      
      expect(timer.getState()).toBe('IDLE');
      expect(timer.getTimeRemaining()).toBe(0);
      expect(timer.getAnswerStartTime()).toBeNull();
      expect(timer.hasStartedSpeaking()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero delta time', () => {
      timer.startThinking();
      const initialTime = timer.getTimeRemaining();
      
      timer.tick(0);
      
      expect(timer.getTimeRemaining()).toBe(initialTime);
      expect(timer.getState()).toBe('THINKING');
    });

    it('should handle negative delta time', () => {
      timer.startThinking();
      const initialTime = timer.getTimeRemaining();
      
      timer.tick(-1000);
      
      expect(timer.getTimeRemaining()).toBe(initialTime); // Should not go negative
      expect(timer.getState()).toBe('THINKING');
    });

    it('should handle very large delta time', () => {
      timer.startThinking();
      
      timer.tick(60000); // 60 seconds
      
      expect(timer.getTimeRemaining()).toBe(30000); // Should be in answer phase
      expect(timer.getState()).toBe('ANSWERING_ACTIVE');
    });
  });
});
