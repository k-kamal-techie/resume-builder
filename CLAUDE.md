@AGENTS.md

# ResumeAI — AI-Powered Resume Builder

## Project Overview
Personal agentic AI resume builder using Claude (Anthropic API) to generate, tailor, and optimize resume content daily.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first config in `globals.css`, no `tailwind.config.js`)
- **Database**: MongoDB + Mongoose (connection cached on `globalThis`)
- **Auth**: Auth.js v5 (NextAuth) with Google + GitHub OAuth, MongoDBAdapter
- **AI**: Anthropic Messages API via OAuth bearer token (NOT Anthropic SDK)
- **Package Manager**: npm

## Project Structure
```
src/
├── app/          # Next.js App Router pages and API routes
│   ├── (auth)/   # Login page (no chrome layout)
│   ├── (main)/   # Public pages (landing, templates)
│   ├── (dashboard)/ # Authenticated pages (dashboard, editor, preview)
│   └── api/      # REST API routes (resumes CRUD, AI endpoints)
├── components/   # React components (ui/, layout/, resume/, ai/, templates/, providers/)
├── lib/          # Utilities (db.ts, mongoose.ts, anthropic.ts, validations/)
├── models/       # Mongoose models (User, Resume, ChatHistory)
└── types/        # TypeScript interfaces (resume.ts, ai.ts, next-auth.d.ts)
auth.ts           # Root-level Auth.js v5 config
middleware.ts     # Route protection for dashboard/editor/preview
```

## Key Architectural Decisions
- **Two MongoDB connections**: Native `MongoClient` (src/lib/db.ts) for Auth.js adapter + Mongoose (src/lib/mongoose.ts) for app data.
- **Auth.js v5 config at project root**: `auth.ts` must be at root, not inside `src/`.
- **Route protection**: Cookie-based middleware (`middleware.ts`) + server-side `auth()` check in dashboard layout. Edge runtime can't access MongoDB, so middleware checks session cookie presence only.
- **Anthropic API direct fetch** (`src/lib/anthropic.ts`): Uses `fetch()` with OAuth bearer token, NOT the Anthropic SDK. Requirements:
  - Headers must match exactly: `Authorization: Bearer <token>`, `anthropic-version: 2023-06-01`, `anthropic-beta: claude-code-20250219,oauth-2025-04-20,fine-grained-tool-streaming-2025-05-14`
  - **System message is MANDATORY and LOCKED**: `[{ "type": "text", "text": "You are Claude Code, Anthropic's official CLI for Claude." }]` — NEVER change this text.
  - Per-route prompts (resume writer, etc.) are injected into user messages via `buildMessages()`, NOT the system field.
  - Default model: `claude-opus-4-6` (configurable via `ANTHROPIC_MODEL` env var)
- **Two-panel editor layout**: AI Chat (70%) + Preview/JSON (30%). No form-based editing — all edits via AI chat or JSON editor. AI auto-applies changes with undo support (50 steps).

## Code Conventions
- Use `@/*` import alias for all `src/` imports
- Mongoose models use `mongoose.models.X || mongoose.model()` pattern
- API routes: (1) check auth, (2) connect DB, (3) validate Zod, (4) operate, (5) return JSON
- Client components use `"use client"` directive
- Tailwind v4: `@theme` in `globals.css`, no tailwind.config.js

## AI Features
- **Chat Agent** (`/api/ai/chat`): Streaming conversational resume editing
- **Content Generation** (`/api/ai/generate`): Bullet points, summaries, improvements
- **Resume Tailoring** (`/api/ai/tailor`): Match resume to job descriptions
- **ATS Scoring** (`/api/ai/ats-score`): Compatibility scoring with suggestions

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npx playwright test` — Run E2E browser tests (Chromium, Firefox, WebKit)

## Testing
- **E2E tests** in `e2e/` directory using Playwright
- **Playwright MCP** configured in `.mcp.json` for visual browser testing via Claude Code
