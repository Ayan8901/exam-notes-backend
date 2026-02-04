# Exam Notes

## Overview

Exam Notes is a React Native/Expo mobile application that converts textbook photos and study text into clean, exam-focused revision notes. The app uses OCR (optical character recognition) and AI to transform images of printed text, handwritten notes, or pasted text into structured bullet-point study notes optimized for exam preparation.

The target users are students at all levels - from school to college to competitive exam preparation. The app aims to feel like a combination of a document scanner, ChatGPT, and a revision book.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client is built with React Native using Expo SDK 54 with the new architecture enabled. Key patterns:

- **Navigation**: Uses React Navigation with a root stack navigator containing a bottom tab navigator (Home, Notes, Settings) and modal screens (NoteDetail, CreateNote)
- **State Management**: React Query for server state, React Context for theme preferences, AsyncStorage for local note persistence
- **Theming**: Custom theme system with light/dark/system modes, stored in ThemeContext and persisted to AsyncStorage
- **Component Pattern**: Themed wrapper components (ThemedView, ThemedText) that automatically apply current theme colors
- **Path Aliases**: `@/` maps to `./client/`, `@shared/` maps to `./shared/`

### Backend Architecture

The server is an Express.js application written in TypeScript:

- **API Design**: REST endpoints for note generation via OCR and text input
- **File Handling**: Multer middleware for handling up to 25 image uploads at once
- **AI Integration**: OpenAI client configured through Replit AI Integrations for both image analysis (OCR) and text generation

### Data Flow

1. User selects images or pastes text on Home screen
2. Images are uploaded to `/api/generate-notes` endpoint
3. Server processes images through OpenAI vision API for OCR
4. Combined text is sent to OpenAI for structured note generation
5. Generated notes are returned and saved locally via AsyncStorage
6. Notes are viewable, exportable as PDF, and shareable from the Notes tab

### Local Storage Pattern

Notes are stored client-side in AsyncStorage with this structure:
- ID (generated timestamp + random string)
- Title (extracted from AI-generated content)
- Content (markdown-formatted notes)
- CreatedAt timestamp
- SourceType (ocr or text)

## External Dependencies

### AI Services

- **OpenAI API** (via Replit AI Integrations): Used for OCR via vision models and note generation via chat completions. Configuration uses `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables.

### Database

- **PostgreSQL with Drizzle ORM**: Schema defined in `shared/schema.ts` with users table. Note: The current implementation uses in-memory storage for users (`MemStorage`), but the database schema is ready for Postgres integration. Notes themselves are stored client-side in AsyncStorage, not in the database.

### Key npm Dependencies

- **expo-image-picker**: For selecting photos from device gallery
- **expo-print** and **expo-sharing**: For PDF export functionality
- **expo-clipboard**: For copy-to-clipboard feature
- **react-native-keyboard-controller**: For keyboard-aware scroll behavior on native platforms
- **expo-haptics**: For tactile feedback on interactions

### Replit-Specific Integrations

The `server/replit_integrations/` folder contains pre-built modules for:
- **Image generation**: OpenAI image API wrapper
- **Audio/Voice**: Voice recording, playback, and transcription utilities
- **Chat**: Conversation storage and streaming chat routes
- **Batch processing**: Rate-limited parallel API call utility

These are available for future features but the core app primarily uses the image client for OCR.