import { Router } from 'express';
import { generateQuestions } from '../services/claude.js';
import { validateBody } from '../middleware/validation.js';
import { MaterialInputSchema } from '../../../shared/types.js';

const router = Router();

router.post('/', validateBody(MaterialInputSchema), async (req, res) => {
  try {
    const { text, difficulty } = req.body;
    
    if (!text || text.trim().length < 100) {
      return res.status(400).json({
        error: 'Material text must be at least 100 characters long',
      });
    }

    const result = await generateQuestions(text, difficulty);
    
    if ('error' in result) {
      return res.status(422).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error in /api/questions:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
