import OpenAI from 'openai';
import { env } from '../config/env.js';
import type { STTResponse } from '../../../shared/types.js';

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<STTResponse> {
  try {
    // Create a File-like object from the buffer
    const audioFile = new File([audioBuffer], 'audio.webm', { type: mimeType });
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    // Sanitize transcript
    const sanitizedTranscript = transcription
      .trim()
      .replace(/\s+/g, ' ')
      .substring(0, 2000); // Limit to 2k chars

    return {
      transcript: sanitizedTranscript,
    };

  } catch (error) {
    console.error('Error transcribing audio:', error);
    return {
      transcript: '',
    };
  }
}
