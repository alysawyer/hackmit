import { z } from 'zod';

// Question generation schemas
export const QuestionItemSchema = z.object({
  id: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  prompt: z.string().max(160),
  topic: z.string().optional(),
  sourceWindow: z.string().max(200).optional(),
});

export const QuestionListResponseSchema = z.object({
  questions: z.array(QuestionItemSchema).length(20),
});

export const QuestionGenerationErrorSchema = z.object({
  error: z.string(),
});

// Evaluation schemas
export const EvalRequestSchema = z.object({
  questionId: z.string(),
  questionPrompt: z.string(),
  userAnswer: z.string(),
  materialContext: z.string().optional(),
});

export const WrongSpanSchema = z.object({
  start: z.number().int().min(0),
  end: z.number().int().min(0),
});

export const EvalResponseSchema = z.object({
  verdict: z.enum(['CORRECT', 'INCORRECT']),
  briefFeedback: z.string().max(200),
  wrongSpans: z.array(WrongSpanSchema).optional(),
});

// Transcript and summary schemas
export const TranscriptEntrySchema = z.object({
  questionId: z.string(),
  questionPrompt: z.string(),
  userAnswer: z.string(),
  verdict: z.enum(['CORRECT', 'INCORRECT']),
  briefFeedback: z.string().optional(),
});

export const GameSummarySchema = z.object({
  total: z.number().int().min(0),
  correct: z.number().int().min(0),
  incorrect: z.number().int().min(0),
  transcript: z.array(TranscriptEntrySchema),
});

// STT schema
export const STTResponseSchema = z.object({
  transcript: z.string(),
});

// Material input schema
export const MaterialInputSchema = z.object({
  text: z.string().max(50000), // 50k char limit
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

// Export TypeScript types
export type QuestionItem = z.infer<typeof QuestionItemSchema>;
export type QuestionListResponse = z.infer<typeof QuestionListResponseSchema>;
export type QuestionGenerationError = z.infer<typeof QuestionGenerationErrorSchema>;
export type EvalRequest = z.infer<typeof EvalRequestSchema>;
export type EvalResponse = z.infer<typeof EvalResponseSchema>;
export type WrongSpan = z.infer<typeof WrongSpanSchema>;
export type TranscriptEntry = z.infer<typeof TranscriptEntrySchema>;
export type GameSummary = z.infer<typeof GameSummarySchema>;
export type STTResponse = z.infer<typeof STTResponseSchema>;
export type MaterialInput = z.infer<typeof MaterialInputSchema>;

// Difficulty type
export type Difficulty = 'easy' | 'medium' | 'hard';

// Verdict type
export type Verdict = 'CORRECT' | 'INCORRECT';
