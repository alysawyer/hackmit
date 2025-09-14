import Anthropic from '@anthropic-ai/sdk';
import { env } from '../config/env.js';
import { 
  QuestionListResponseSchema, 
  QuestionGenerationErrorSchema,
  EvalResponseSchema,
  type QuestionListResponse,
  type QuestionGenerationError,
  type EvalResponse,
  type Difficulty 
} from '../../../shared/types.js';

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

const GENERATION_SYSTEM_PROMPT = `You are a pedagogy-aware question generator. Produce exactly 20 concise questions that a well-prepared student can answer in ~15 seconds each.

Match the requested difficulty.

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "difficulty": "easy",
      "prompt": "Question text here",
      "topic": "optional topic"
    }
  ]
}

Requirements:
- Exactly 20 questions
- Each prompt < 160 characters
- Use the requested difficulty for all questions
- Generate unique IDs (q1, q2, q3, etc.)
- Base questions on the provided material
- If insufficient material, return: {"error": "Insufficient material"}

No additional text, just the JSON.`;

const EVALUATION_SYSTEM_PROMPT = `You are evaluating a user's spoken answer to a quiz question. Be VERY LENIENT - accept answers that show any reasonable understanding.

IMPORTANT RULES:
1. Mark as CORRECT if the answer contains the key concept, even if:
   - The phrasing is different
   - There are minor errors or omissions
   - The answer is incomplete but shows understanding
   - There are transcription errors from speech-to-text

2. Only mark as INCORRECT if:
   - The answer is completely wrong
   - The answer shows no understanding of the question
   - The answer is about something entirely different

3. For League of Legends questions specifically:
   - Accept common abbreviations (e.g., "Kat" for Katarina)
   - Accept alternative names/spellings
   - Accept partial correct information

Return ONLY this JSON format:
{
  "verdict": "CORRECT" or "INCORRECT",
  "briefFeedback": "For CORRECT: 'Correct!' or similar. For INCORRECT: a short summary of why the answer is wrong.",
  "correctAnswer": "[the correct answer, if INCORRECT]",
  "explanation": "[a concise explanation of why the correct answer is correct and why the user's answer is wrong, if INCORRECT]"
}

If the answer is CORRECT, you may omit correctAnswer and explanation.

Examples of CORRECT verdicts:
- Question: "What region do Yasuo and Yone originate from?" 
  Answer: "Ionia" or "they're from Ionia" or "I think Ionia" → CORRECT
- Question: "Who is the champion of Demacia?"
  Answer: "Garen" or "It's Garen" or "Karen" (transcription error) → CORRECT

No additional text, just the JSON.`;

export async function generateQuestions(
  material: string,
  difficulty: Difficulty
): Promise<QuestionListResponse | QuestionGenerationError> {
  try {
    // Truncate material to ~6-8k chars
    const truncatedMaterial = material.length > 8000 
      ? material.substring(0, 8000) + '...' 
      : material;

    const userPrompt = `Material: ${truncatedMaterial}

Difficulty: ${difficulty}

Generate exactly 20 questions based on this material at ${difficulty} difficulty level. Each question should be answerable in ~15 seconds by a well-prepared student.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.1,
      top_p: 0.9,
      system: GENERATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content?.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      throw new Error('Invalid JSON in Claude response');
    }

    // Try to parse as error first
    const errorResult = QuestionGenerationErrorSchema.safeParse(parsedResponse);
    if (errorResult.success) {
      return errorResult.data;
    }

    // Parse as question list
    const questionResult = QuestionListResponseSchema.safeParse(parsedResponse);
    if (questionResult.success) {
      return questionResult.data;
    }

    throw new Error('Claude response does not match expected schema');

  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Retry once
    try {
      const retryResponse = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        top_p: 0.9,
        system: GENERATION_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Material: ${material.length > 8000 ? material.substring(0, 8000) + '...' : material}

Difficulty: ${difficulty}

Generate exactly 20 questions based on this material at ${difficulty} difficulty level. Return valid JSON only.`,
          },
        ],
      });

      const retryContent = retryResponse.content[0];
      if (retryContent?.type === 'text') {
        const retryJsonMatch = retryContent.text.match(/\{[\s\S]*\}/);
        if (retryJsonMatch) {
          const retryParsed = JSON.parse(retryJsonMatch[0]);
          const retryResult = QuestionListResponseSchema.safeParse(retryParsed);
          if (retryResult.success) {
            return retryResult.data;
          }
        }
      }
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    }

    return { error: 'Failed to generate questions. Please try again with different material.' };
  }
}

export async function evaluateAnswer(
  questionPrompt: string,
  userAnswer: string,
  materialContext?: string
): Promise<EvalResponse> {
  try {
    const contextPrompt = materialContext 
      ? `Question: ${questionPrompt}

User's Spoken Answer: "${userAnswer}"

Material Context for Reference: ${materialContext}

Evaluate if the user's answer is correct. Be lenient with spoken language variations. If incorrect, provide the actual correct answer in the briefFeedback.`
      : `Question: ${questionPrompt}

User's Spoken Answer: "${userAnswer}"

Evaluate if the user's answer demonstrates understanding of the core concept. Be lenient with spoken language variations. If incorrect, provide the actual correct answer based on general knowledge.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1000,
      temperature: 0.2,
      top_p: 0.95,
      system: EVALUATION_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: contextPrompt,
        },
      ],
    });

    const content = response.content[0];
    if (content?.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    // Extract JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    // Patch: If INCORRECT and correctAnswer/explanation missing, try to extract from briefFeedback
    let result = EvalResponseSchema.parse(parsedResponse);
    if (result.verdict === 'INCORRECT') {
      // Try to extract correct answer from briefFeedback if not present
      if (!result.correctAnswer && result.briefFeedback) {
        const match = result.briefFeedback.match(/correct answer is:?\s*([^.]+)[.]/i);
        if (match && match[1]) {
          result = { ...result, correctAnswer: match[1].trim() };
        }
      }
      // Fallback explanation if not present
      if (!result.explanation && result.briefFeedback) {
        result = { ...result, explanation: result.briefFeedback };
      }
    }
    return result;

  } catch (error) {
    console.error('Error evaluating answer:', error);
    
    // More informative fallback
    return {
      verdict: 'INCORRECT',
      briefFeedback: `Could not verify answer. Your answer: "${userAnswer.slice(0, 50)}${userAnswer.length > 50 ? '...' : ''}"`,
    };
  }
}
