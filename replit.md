# Exam Notes

## Overview

Exam Notes is a React Native/Expo mobile application that converts textbook photos and study text into clean, exam-focused revision notes. Users can upload up to 25 images for OCR processing or paste text directly, and the app uses OpenAI's vision and text generation APIs to produce concise, exam-ready bullet point notes.

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
- **Database**: PostgreSQL with Drizzle ORM for schema management (used for chat/conversation storage)

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
- **OpenAI API** (via Replit AI Integrations): Used for vision/OCR processing and text generation. Configured through `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables

### Database
- **PostgreSQL**: Used with Drizzle ORM for conversation and message storage. Requires `DATABASE_URL` environment variable

### Key NPM Packages
- **expo**: React Native framework (SDK 54)
- **drizzle-orm/drizzle-zod**: Type-safe ORM and schema validation
- **@tanstack/react-query**: Server state management
- **multer**: Multipart form handling for image uploads
- **expo-image-picker**: Native image selection
- **expo-print/expo-sharing**: PDF export and sharing functionality
- **p-limit/p-retry**: Batch processing utilities with rate limiting