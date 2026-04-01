# Architecture Decisions — Agentic Resume

## Stack
- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** — CSS-first, `@theme inline` in `globals.css`, no `tailwind.config.js`
- **MongoDB Atlas** — two connections: native `MongoClient` (Auth.js) + Mongoose (app data)
- **Auth.js v5** — Google OAuth, MongoDBAdapter, `auth.ts` at project root
- **Anthropic API** — direct `fetch()` with OAuth bearer token, NOT the SDK

## Route Groups
```
(auth)      → login only, minimal layout (no sidebar)
(main)      → public pages (landing, templates)
(dashboard) → AppSidebar + content (dashboard, knowledge-base, settings)
(editor)    → AppSidebar + full-screen editor/preview
```

## Authentication
- `middleware.ts` — checks session cookie (Edge-compatible, no MongoDB)
- Layout `auth()` checks — authoritative, server-side

## Data Models

### Resume
```typescript
userId, title, templateId ("classic"|"modern"|"minimal"),
data: { personalInfo, experience, education, skills, projects, certifications },
jobDescription: string,  // saved JD per resume
isPublic, lastEditedAt
```

### KnowledgeBase (one per user)
```typescript
userId (unique),
profile: { fullName, headline, email, phone, location, website, linkedin, github, bio },
timeline: [{ type, title, organization, startDate, endDate, current, description, highlights, skills, metrics, tags }],
skills: [{ name, category, proficiency, yearsOfExperience, tags }],
projects: [{ name, description, role, technologies, url, highlights, metrics, tags }],
achievements: [{ title, description, date, issuer, url, tags }]
```

### ChatHistory (sessions — multiple per resume)
```typescript
resumeId, userId,
title: string,           // auto-named from first message
messages: [{ role, content, timestamp }]
// Compound index: { resumeId, userId }
```

### UserSettings (one per user)
```typescript
userId (unique, indexed),
anthropicToken: string,  // AES-256-GCM encrypted
anthropicModel: string,  // default "claude-sonnet-4-6"
createdAt, updatedAt
```

## API Routes
```
GET/POST  /api/resumes
GET/PUT/DELETE  /api/resumes/[id]
GET/PUT  /api/knowledge-base
GET/POST  /api/chat-sessions?resumeId=
GET/PUT/DELETE  /api/chat-sessions/[id]
POST  /api/ai/chat  (SSE stream)
POST  /api/ai/generate
POST  /api/ai/tailor
POST  /api/ai/ats-score
GET/PUT  /api/user/settings
```

## Client Service Layer
All client API calls go through `src/lib/services/`:
- `resume.ts` — CRUD for resumes
- `knowledge-base.ts` — fetch/update KB + extractKBData helper
- `ai.ts` — sendChatMessage, tailorResume, getAtsScore, generateContent
- `chat-session.ts` — CRUD for chat sessions
- `user-settings.ts` — fetch/update user API key and model

## Per-User API Settings
- `getUserAnthropicConfig(userId)` resolves token + model: user DB → env fallback → `NoTokenConfiguredError`
- Tokens encrypted with AES-256-GCM (`src/lib/encryption.ts`), `ENCRYPTION_KEY` env var
- API routes catch `NoTokenConfiguredError` → return 422 with `NO_API_TOKEN_CONFIGURED`
- Chat panel detects this error → shows settings link

## Rate Limiting
- In-memory sliding window (`src/lib/rate-limit.ts`)
- Per-route: chat 15/60s, tailor/ats 5/60s, generate 10/60s

## JSON Editor
- `react-simple-code-editor` + Prism.js for syntax highlighting
- Custom light/dark theme (slate-based colors matching design system)
- Line numbers via CSS counters
- Shared by Knowledge Base page and resume editor "Edit JSON" tab

## AI Enrichment Format
Every chat message is enriched client-side before sending:
```
[Your Knowledge Base]
{KB summary JSON}

[Current Resume]
{resume JSON}

[Instructions]
- resume-json block → apply to resume
- kb-json block → apply to knowledge base
- Ask questions before major changes

User request: {message}
```

Post-streaming auto-apply:
- `resume-json`/`json` block with `personalInfo` → `onApplyResumeData()`
- `kb-json` block with `profile` → `onApplyKBData()`

## Undo System
- `undoStack: ResumeData[]` (max 50) in editor state
- Every apply pushes current state before overwriting
- Covers AI auto-apply AND JSON editor Apply

## Theme System
- CSS vars in `:root`: `--accent-50` → `--accent-700`
- Registered via `@theme inline` → `bg-accent-600` etc. usable in Tailwind
- `ThemeProvider` sets CSS vars on `document.documentElement`
- 7 presets, persisted in `localStorage`
