import { describe, it, expect } from 'vitest';
import { 
  QuestionItemSchema,
  QuestionListResponseSchema,
  EvalRequestSchema,
  EvalResponseSchema,
  TranscriptEntrySchema,
  GameSummarySchema,
  MaterialInputSchema,
  STTResponseSchema,
} from '../shared/types';

describe('Schema Validation', () => {
  describe('QuestionItemSchema', () => {
    it('should validate a valid question item', () => {
      const validQuestion = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        difficulty: 'medium',
        prompt: 'What is the capital of France?',
        topic: 'Geography',
        sourceWindow: 'Chapter 3: European Capitals',
      };

      const result = QuestionItemSchema.safeParse(validQuestion);
      expect(result.success).toBe(true);
    });

    it('should reject question with invalid difficulty', () => {
      const invalidQuestion = {
        id: '123',
        difficulty: 'extreme',
        prompt: 'What is the capital of France?',
      };

      const result = QuestionItemSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('should reject question with prompt too long', () => {
      const invalidQuestion = {
        id: '123',
        difficulty: 'easy',
        prompt: 'x'.repeat(161), // 161 characters, exceeds 160 limit
      };

      const result = QuestionItemSchema.safeParse(invalidQuestion);
      expect(result.success).toBe(false);
    });

    it('should accept question without optional fields', () => {
      const minimalQuestion = {
        id: '123',
        difficulty: 'hard',
        prompt: 'Short question?',
      };

      const result = QuestionItemSchema.safeParse(minimalQuestion);
      expect(result.success).toBe(true);
    });
  });

  describe('QuestionListResponseSchema', () => {
    it('should validate exactly 20 questions', () => {
      const questions = Array.from({ length: 20 }, (_, i) => ({
        id: `question-${i}`,
        difficulty: 'medium' as const,
        prompt: `Question ${i + 1}?`,
      }));

      const validResponse = { questions };
      const result = QuestionListResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject response with 19 questions', () => {
      const questions = Array.from({ length: 19 }, (_, i) => ({
        id: `question-${i}`,
        difficulty: 'medium' as const,
        prompt: `Question ${i + 1}?`,
      }));

      const invalidResponse = { questions };
      const result = QuestionListResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject response with 21 questions', () => {
      const questions = Array.from({ length: 21 }, (_, i) => ({
        id: `question-${i}`,
        difficulty: 'medium' as const,
        prompt: `Question ${i + 1}?`,
      }));

      const invalidResponse = { questions };
      const result = QuestionListResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('EvalRequestSchema', () => {
    it('should validate a complete eval request', () => {
      const validRequest = {
        questionId: 'q123',
        questionPrompt: 'What is 2+2?',
        userAnswer: 'Four',
        materialContext: 'Basic arithmetic chapter',
      };

      const result = EvalRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate eval request without material context', () => {
      const validRequest = {
        questionId: 'q123',
        questionPrompt: 'What is 2+2?',
        userAnswer: 'Four',
      };

      const result = EvalRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('EvalResponseSchema', () => {
    it('should validate correct response', () => {
      const validResponse = {
        verdict: 'CORRECT',
        briefFeedback: 'Well done!',
      };

      const result = EvalResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate incorrect response with wrong spans', () => {
      const validResponse = {
        verdict: 'INCORRECT',
        briefFeedback: 'The answer should be four, not five.',
        wrongSpans: [
          { start: 15, end: 19 }, // "five"
        ],
      };

      const result = EvalResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should reject invalid verdict', () => {
      const invalidResponse = {
        verdict: 'MAYBE',
        briefFeedback: 'Unclear',
      };

      const result = EvalResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });

    it('should reject feedback too long', () => {
      const invalidResponse = {
        verdict: 'INCORRECT',
        briefFeedback: 'x'.repeat(201), // 201 characters, exceeds 200 limit
      };

      const result = EvalResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe('TranscriptEntrySchema', () => {
    it('should validate complete transcript entry', () => {
      const validEntry = {
        questionId: 'q1',
        questionPrompt: 'What is the capital of France?',
        userAnswer: 'Paris',
        verdict: 'CORRECT',
        briefFeedback: 'Correct!',
      };

      const result = TranscriptEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });

    it('should validate entry without feedback', () => {
      const validEntry = {
        questionId: 'q1',
        questionPrompt: 'What is the capital of France?',
        userAnswer: 'London',
        verdict: 'INCORRECT',
      };

      const result = TranscriptEntrySchema.safeParse(validEntry);
      expect(result.success).toBe(true);
    });
  });

  describe('GameSummarySchema', () => {
    it('should validate complete game summary', () => {
      const validSummary = {
        total: 20,
        correct: 15,
        incorrect: 5,
        transcript: [
          {
            questionId: 'q1',
            questionPrompt: 'Test question?',
            userAnswer: 'Test answer',
            verdict: 'CORRECT' as const,
          },
        ],
      };

      const result = GameSummarySchema.safeParse(validSummary);
      expect(result.success).toBe(true);
    });

    it('should reject negative numbers', () => {
      const invalidSummary = {
        total: -1,
        correct: 15,
        incorrect: 5,
        transcript: [],
      };

      const result = GameSummarySchema.safeParse(invalidSummary);
      expect(result.success).toBe(false);
    });
  });

  describe('MaterialInputSchema', () => {
    it('should validate valid material input', () => {
      const validInput = {
        text: 'This is a sample text with enough content to generate questions from.',
        difficulty: 'medium',
      };

      const result = MaterialInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject text too long', () => {
      const invalidInput = {
        text: 'x'.repeat(50001), // 50,001 characters, exceeds 50,000 limit
        difficulty: 'easy',
      };

      const result = MaterialInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('STTResponseSchema', () => {
    it('should validate STT response', () => {
      const validResponse = {
        transcript: 'This is the transcribed text',
      };

      const result = STTResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });

    it('should validate empty transcript', () => {
      const validResponse = {
        transcript: '',
      };

      const result = STTResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values appropriately', () => {
      const result = QuestionItemSchema.safeParse(null);
      expect(result.success).toBe(false);
    });

    it('should handle undefined values appropriately', () => {
      const result = QuestionItemSchema.safeParse(undefined);
      expect(result.success).toBe(false);
    });

    it('should handle empty objects', () => {
      const result = QuestionItemSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should handle arrays instead of objects', () => {
      const result = QuestionItemSchema.safeParse([]);
      expect(result.success).toBe(false);
    });
  });
});
