import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    process.exit(1);
  }
}

export const env = validateEnv();
