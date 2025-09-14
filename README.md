# Voice Quiz Game

A production-ready voice-answer quiz game that generates questions from study material and evaluates spoken responses using AI.

## Features

- **Material Input**: Upload PDFs or paste text directly
- **AI Question Generation**: Claude generates exactly 20 questions tailored to your material and difficulty level
- **Voice Interaction**: Answer questions using speech-to-text (browser or server-based)
- **Smart Timing**: 30s thinking time + 30s answer time with 10s speech-start requirement
- **AI Evaluation**: Claude evaluates answers with detailed feedback
- **Comprehensive Feedback**: View detailed results with highlighted mistakes and improvement tips

## Architecture

### Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **AI Services**: Anthropic Claude 3.5 Sonnet + OpenAI Whisper
- **State Management**: Zustand
- **PDF Processing**: PDF.js
- **Testing**: Vitest + Testing Library

### Timer State Machine
```
IDLE → THINKING (30s) → ANSWERING_ACTIVE (30s) → SHOWING_RESULT → NEXT
                ↓              ↓
            [MIC PRESS]   [NO SPEECH 10s]
                ↓              ↓
         ANSWERING_ACTIVE  ANSWERING_FAIL
```

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key
- OpenAI API key

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd voice-quiz-game
npm install
cd server && npm install
cd ../client && npm install
```

2. **Environment setup:**
```bash
# Copy example environment file
cp env.example .env

# Edit .env with your API keys:
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
OPENAI_API_KEY=sk-your-openai-key-here
```

3. **Start development servers:**
```bash
# From root directory - starts both client and server
npm run dev

# Or start individually:
npm run server:dev  # Server on :3001
npm run client:dev  # Client on :5173
```

## API Endpoints

### POST /api/questions
Generate 20 questions from study material.

**Request:**
```bash
curl -X POST http://localhost:3001/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your study material here (min 100 chars)...",
    "difficulty": "medium"
  }'
```

**Response:**
```json
{
  "questions": [
    {
      "id": "uuid",
      "difficulty": "medium",
      "prompt": "What is the main concept?",
      "topic": "Introduction",
      "sourceWindow": "Chapter 1: Overview"
    }
  ]
}
```

### POST /api/eval
Evaluate a user's answer to a question.

**Request:**
```bash
curl -X POST http://localhost:3001/api/eval \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "uuid",
    "questionPrompt": "What is the main concept?",
    "userAnswer": "The main concept is...",
    "materialContext": "Chapter 1: Overview"
  }'
```

**Response:**
```json
{
  "verdict": "CORRECT",
  "briefFeedback": "Excellent understanding!",
  "wrongSpans": []
}
```

### POST /api/stt
Transcribe audio to text using OpenAI Whisper.

**Request:**
```bash
curl -X POST http://localhost:3001/api/stt \
  -F "audio=@recording.webm"
```

**Response:**
```json
{
  "transcript": "This is the transcribed text"
}
```

## Game Flow

1. **Material Input**: User provides study material (text or PDF) and selects difficulty
2. **Question Generation**: Server calls Claude to generate exactly 20 questions
3. **Quiz Loop**: For each question:
   - **Think Phase**: 30s countdown (user can start answering early)
   - **Answer Phase**: 30s countdown with 10s speech-start window
   - **Evaluation**: Claude evaluates the response
   - **Result Display**: Brief result shown before next question
4. **Results**: Final score and performance summary
5. **Feedback**: Detailed transcript with highlighted errors and tips

## Timer Logic

The timer uses a single `requestAnimationFrame` loop with `performance.now()` for high precision:

- **No chained timeouts** - prevents drift
- **10-second speech detection** - auto-fail if no speech detected
- **State machine transitions** - deterministic flow
- **Performance monitoring** - tracks answer start time

## Speech Recognition

**Primary**: Browser `webkitSpeechRecognition` (Chrome/Safari)
**Fallback**: Audio recording → server Whisper API

Features:
- Real-time transcript updates
- Speech start detection
- Audio level monitoring
- Automatic cleanup

## Security & Performance

- **API keys server-side only** - never exposed to client
- **Rate limiting** - 100 requests per 15 minutes
- **Input validation** - Zod schemas on all endpoints
- **Material truncation** - 8k character limit for Claude
- **Audio limits** - 10MB max file size
- **CORS protection** - configured origins only

## Testing

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Test specific areas
npm test timer.test.ts
npm test schemas.test.ts
```

## Build & Deploy

```bash
# Build both client and server
npm run build

# Start production server
cd server && npm start
```

## Known Limitations

- Speech recognition requires HTTPS in production
- PDF text extraction quality depends on source document
- Claude API rate limits apply (contact Anthropic for higher limits)
- 20-question limit is hardcoded (can be modified in shared/types.ts)
- Audio recording requires user gesture to start

## Troubleshooting

### Common Issues

**"Failed to generate questions"**
- Check API keys in .env file
- Ensure material is at least 100 characters
- Verify Anthropic API quota

**Speech recognition not working**
- Enable microphone permissions
- Use HTTPS (required for production)
- Check browser compatibility (Chrome/Safari recommended)

**PDF upload fails**
- Ensure file is a valid PDF
- Check file size (reasonable limits)
- Try extracting text manually if PDF is complex

### Debug Mode

Set `NODE_ENV=development` to see detailed logs:
- Claude API requests/responses
- Timer state transitions
- Speech recognition events
- Error stack traces

## Development

### Code Organization

```
├── shared/           # Shared TypeScript types and schemas
├── server/          # Express API server
│   ├── src/
│   │   ├── config/  # Environment and configuration
│   │   ├── services/# Claude, STT, and other services
│   │   ├── routes/  # API route handlers
│   │   └── middleware/ # Validation and other middleware
├── client/          # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── hooks/   # Custom hooks (timer, speech)
│   │   ├── stores/  # Zustand state management
│   │   └── utils/   # Utilities (PDF parser, etc.)
└── tests/           # Test files
```

### Contributing

1. Follow TypeScript strict mode
2. Use Zod for all API validation
3. Test timer logic thoroughly
4. Maintain accessibility (ARIA labels)
5. Keep dependencies minimal