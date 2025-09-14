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

Output only the JSON for QuestionListResponse (no prose).

Keep each prompt < 160 chars; avoid multi-part questions.

Pull from provided material text. If insufficient, return error JSON: { "error": "Insufficient material" }.`;

const EVALUATION_SYSTEM_PROMPT = `You evaluate one user answer for the provided question.

Use supplied materialContext as ground truth; if absent, use general domain knowledge conservatively.

Return only EvalResponse JSON; no prose.

Be strict but fair. Mark INCORRECT if the core claim is wrong, missing, or off-topic.

Fill wrongSpans with index ranges for clearly wrong phrases when possible; keep briefFeedback <= 200 chars.`;

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
      model: 'claude-3-5-sonnet-20241022',
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
        model: 'claude-3-5-sonnet-20241022',
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
User Answer: ${userAnswer}
Material Context: ${materialContext}

Evaluate the user's answer based on the question and material context.`
      : `Question: ${questionPrompt}
User Answer: ${userAnswer}

Evaluate the user's answer based on general domain knowledge.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.1,
      top_p: 0.9,
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
    const result = EvalResponseSchema.parse(parsedResponse);
    return result;

  } catch (error) {
    console.error('Error evaluating answer:', error);
    
    // Fallback evaluation
    return {
      verdict: 'INCORRECT',
      briefFeedback: 'Unable to evaluate answer due to technical error.',
    };
  }
}
