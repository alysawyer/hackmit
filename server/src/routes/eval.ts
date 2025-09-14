import { Router } from 'express';
import { evaluateAnswer } from '../services/claude.js';
import { validateBody } from '../middleware/validation.js';
import { EvalRequestSchema } from '../../../shared/types.js';

const router = Router();

router.post('/', validateBody(EvalRequestSchema), async (req, res) => {
  try {
    const { questionPrompt, userAnswer, materialContext } = req.body;
    
    // Handle empty or very short answers

    if (!userAnswer || userAnswer.trim().length < 2) {
      return res.json({
        verdict: 'INCORRECT',
        briefFeedback: 'Answer too short or empty.',
        correctAnswer: undefined,
        explanation: 'Please provide a more complete answer.',
      });
    }

    const result = await evaluateAnswer(questionPrompt, userAnswer, materialContext);
    res.json(result);
    
  } catch (error) {
    console.error('Error in /api/eval:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
