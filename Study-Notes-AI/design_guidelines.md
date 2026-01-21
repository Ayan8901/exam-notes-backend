# Exam Notes - Design Guidelines

## Brand Identity

**App Purpose**: Convert textbook photos and study text into clean, exam-focused revision notes using OCR + AI.

**Target Users**: School students, college students, competitive exam prep learners.

**Aesthetic Direction**: Professional, fast, clean. The app should feel like "Scanner + ChatGPT + Exam Revision Book" - serious and trustworthy, optimized for speed and efficiency.

**Memorable Element**: Graduation cap watermark that subtly reinforces the academic purpose without cluttering the interface.

## Navigation Architecture

**Root Navigation**: Bottom Tab Bar (3 tabs)
- **Home**: Main input and note generation screen
- **Notes**: Saved chapters list and management
- **Settings**: Theme toggle, premium upgrade, app info

## Screen-by-Screen Specifications

### Home Screen

**Purpose**: Input study materials and generate exam notes.

**Header**:
- Title: "Exam Notes"
- Subtitle: "Convert your study materials into exam-focused bullet notes"
- Small graduation cap watermark (non-intrusive)
- Transparent background

**Layout**:
- Scrollable content area
- Bottom inset: tabBarHeight + Spacing.xl
- Top inset: insets.top + Spacing.xl

**Input Section A - Upload Images (OCR - Recommended)**:
- "Select up to 25 images" label
- Image picker button
- Real image thumbnails preview grid (not generic "Image1, Image2" labels)
- Support for printed text, handwritten text, and mathematical notation

**Input Section B - Paste Text (Optional)**:
- Large multi-line text input box
- Placeholder: "Or paste your study text here..."

**Validation Alert**:
- If both inputs used simultaneously: "Please use only one input method (OCR is recommended)."

**Action Button**:
- "Generate Exam Notes" button
- Disabled state when no input provided
- Loading state: "Analyzing chapter and generating exam-ready notes…"

### Notes Tab

**Purpose**: Browse, view, and manage saved notes.

**Header**:
- Title: "Notes"
- Standard navigation header
- Top inset: headerHeight + Spacing.xl

**Layout**:
- Scrollable list of saved chapters
- Empty state illustration (empty-notes.png) with text: "No notes yet. Start creating exam notes from the Home tab!"
- Bottom inset: tabBarHeight + Spacing.xl

**Note Card**:
- Display chapter title
- Preview of first few bullet points
- Tap to open full note view

**Full Note View (Modal)**:
- Display full formatted notes (Title, Definition, Key Concepts, Important Points, Formulas, Examples, Quick Revision Tips)
- Action buttons at bottom:
  - Download PDF
  - Share
  - Copy
  - Delete (with confirmation: "Are you sure you want to delete this note?")

**PDF Export**:
- Clean margins, bold headings, bullet formatting
- Filename: ExamNotes_[Topic]_[Date].pdf
- Saved to Downloads folder
- Success toast: "PDF saved to Downloads"

### Settings Screen

**Purpose**: App preferences and account management.

**Header**:
- Title: "Settings"
- Standard navigation header
- Top inset: headerHeight + Spacing.xl

**Layout**:
- Scrollable form
- Bottom inset: tabBarHeight + Spacing.xl

**Settings Options**:
1. **Dark Mode Toggle**
   - Label: "Dark Mode"
   - Switch control (instant, no flicker)
   
2. **Account** (Optional section)
   - Label: "Account"
   - Chevron for navigation

3. **Premium** (Nested under Settings)
   - Label: "Upgrade to Premium"
   - Price: $15 One Time
   - Benefits listed:
     - No ads
     - Unlimited OCR
     - Longer notes
     - Faster AI
     - Cloud backup

4. **App Info**
   - Version 1.0
   - Developer: Exam Notes Team

## Color Palette

**Light Mode**:
- Primary: #2563EB (Professional blue)
- Background: #FFFFFF
- Surface: #F3F4F6
- Text Primary: #111827
- Text Secondary: #6B7280
- Border: #E5E7EB
- Success: #10B981
- Error: #EF4444

**Dark Mode**:
- Primary: #3B82F6
- Background: #121212 (True black)
- Surface: #1E1E1E
- Text Primary: #FFFFFF
- Text Secondary: #9CA3AF
- Border: #374151
- Success: #34D399
- Error: #F87171

## Typography

**Font**: System default (SF Pro on iOS, Roboto on Android)

**Type Scale**:
- Header Title: 28px Bold
- Subtitle: 16px Regular
- Section Label: 14px Medium
- Button Text: 16px Semibold
- Body Text: 15px Regular
- Note Title: 20px Bold
- Note Content: 15px Regular

## AI Notes Format

**Structure** (always output in this order):
1. **Title** (Bold)
2. **Definition**
3. **Key Concepts** (bullets)
4. **Important Points** (bullets)
5. **Formulas** (if any)
6. **Examples** (if relevant)
7. **Quick Revision Tips** (bullets)

**Style**:
- Headings bold
- Bullet points for all lists
- No paragraphs
- Student-friendly exam language
- Expand even small OCR input into comprehensive notes
- Never output tiny or incomplete notes

## OCR Rules

**Pipeline**: Image → OCR → AI Notes (no image understanding)

**Extract**: Only visible text (printed, handwritten, math)

**Error Handling**: If no readable text → "No readable text found."

**No Hallucination**: Never guess or infer content not present in the image.

## Visual Design

- All touchable components have subtle press feedback (opacity or scale)
- Smooth animations for screen transitions and theme switching
- Clean card-based layouts with consistent spacing
- No emojis (use Feather icons from @expo/vector-icons)
- Floating buttons use subtle shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

## Assets to Generate

1. **icon.png** - App icon with graduation cap motif - WHERE USED: Device home screen
2. **splash-icon.png** - Graduation cap on clean background - WHERE USED: App launch screen
3. **empty-notes.png** - Illustration of empty notebook or folder - WHERE USED: Notes tab when no saved notes
4. **graduation-cap-watermark.png** - Subtle watermark graphic - WHERE USED: Home screen header