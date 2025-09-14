import { Router } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../services/stt.js';

const router = Router();

// Configure multer for audio upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

router.post('/', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No audio file provided',
      });
    }

    const result = await transcribeAudio(req.file.buffer, req.file.mimetype);
    res.json(result);
    
  } catch (error) {
    console.error('Error in /api/stt:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

export default router;
