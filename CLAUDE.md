@AGENTS.md

# Agentic Resume — AI-Powered Resume Builder

## Project Overview
Personal agentic AI resume builder using Claude (Anthropic API). Features a Personal Knowledge Base, agentic chat agent, slash commands, multi-session chat history, theme selector, and one-click deployment to AWS EC2.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first config in `globals.css`, no `tailwind.config.js`)
- **Database**: MongoDB + Mongoose (connection cached on `globalThis`)
- **Auth**: Auth.js v5 (NextAuth) with Google + GitHub OAuth, MongoDBAdapter
- **AI**: Anthropic Messages API via OAuth bearer token (NOT Anthropic SDK)
- **Package Manager**: npm

## Project Structure
```
src/
├── app/
│   ├── (auth)/      # Login page (slate-50 bg, no sidebar)
│   ├── (main)/      # Public pages (landing, templates)
│   ├── (dashboard)/ # Authenticated: dashboard, knowledge-base
│   ├── (editor)/    # Full-screen: editor/[id], preview/[id]
│   └── api/         # REST API routes
├── components/
│   ├── ai/          # chat-panel.tsx — main AI chat interface
│   ├── layout/      # app-sidebar.tsx (dark sidebar), navbar/sidebar (no-ops)
│   ├── providers/   # session-provider, theme-provider
│   ├── resume/      # preview-panel, resume-preview, json-editor
│   ├── templates/   # classic, modern, minimal
│   └── ui/          # button, card, input, modal, loading-spinner
├── lib/
│   ├── anthropic.ts         # Anthropic API (LOCKED system message)
│   ├── services/            # Client-side service layer
│   │   ├── ai.ts            # sendChatMessage, tailorResume, getAtsScore
│   │   ├── resume.ts        # CRUD for resumes
│   │   ├── knowledge-base.ts # KB fetch/update
│   │   └── chat-session.ts  # Chat session CRUD
│   └── validations/         # Zod schemas
├── models/          # User, Resume, KnowledgeBase, ChatHistory
├── scripts/         # seed-kb.ts (one-time KB seed from portfolio)
└── types/           # resume.ts, knowledge-base.ts, ai.ts, next-auth.d.ts
auth.ts              # Root-level Auth.js v5 config
middleware.ts        # Cookie-based route protection
```

## Key Architectural Decisions
- **Two MongoDB connections**: Native `MongoClient` (`src/lib/db.ts`) for Auth.js adapter + Mongoose (`src/lib/mongoose.ts`) for app data.
- **Auth.js v5 config at project root**: `auth.ts` must be at root, not inside `src/`.
- **Route protection**: Cookie-based middleware (`middleware.ts`) + server-side `auth()` check in layout. Edge runtime can't access MongoDB, so middleware checks session cookie presence only.
- **Anthropic API** (`src/lib/anthropic.ts`): Direct `fetch()` with OAuth bearer token — NOT the SDK. System message is MANDATORY and LOCKED. See `.claude/skills/anthropic-api.md`.
- **Layout**: No top navbar. A single dark `AppSidebar` (`src/components/layout/app-sidebar.tsx`) handles branding, navigation, user profile, theme picker, and sign out for all authenticated pages.
- **Editor layout**: Full-screen 3-panel — AppSidebar + Chat (flex-1) + Preview (w-[420px]). No forms — all editing via AI chat or JSON editor. Explicit save only (no auto-save).
- **Knowledge Base**: One document per user in `knowledgebases` collection. Stores full professional profile (timeline, skills, projects, achievements). Seeded from portfolio data. Passed to AI as context on every chat message.
- **Chat sessions**: Multiple sessions per resume. Auto-named from first message. Auto-saved with 1s debounce. Supports inline rename (double-click).
- **Theme system**: CSS custom properties (`--accent-50` to `--accent-700`) registered in `@theme inline`. 7 presets. Persisted in `localStorage`. Change updates entire app.
- **Slash commands**: `/tailor`, `/ats`, `/improve`, `/summary`, `/save`, `/jd` — triggered via `/` in chat input.

## Design System
See `.claude/ui/design-system.md` for full reference. Key rules:
- All primary accent uses `accent-*` classes (NOT `blue-*` directly)
- Sidebar: `bg-slate-900`, nav items use `text-slate-400` inactive / `bg-accent-600 text-white` active
- Chat bubbles: agent = `bg-slate-50 border-slate-100`, user = `bg-accent-600 text-white`
- Typography: section labels = `text-xs font-semibold uppercase tracking-wider text-slate-500`
- Borders: `border-slate-100` (light) or `border-slate-200` (medium)
- Cards: `bg-white rounded-2xl border border-slate-200`

## Code Conventions
- Use `@/*` import alias for all `src/` imports
- Mongoose models use `mongoose.models.X || mongoose.model()` pattern
- API routes: (1) check auth, (2) connect DB, (3) validate Zod, (4) operate, (5) return JSON
- Client components use `"use client"` directive
- Tailwind v4: `@theme inline` in `globals.css`, no tailwind.config.js
- Service layer: all client-side API calls go through `src/lib/services/`

## AI Features
- **Chat Agent** (`/api/ai/chat`): Streaming + KB context injection + auto-apply
- **Content Generation** (`/api/ai/generate`): Bullet points, summaries
- **Resume Tailoring** (`/api/ai/tailor`): Match resume to saved JD
- **ATS Scoring** (`/api/ai/ats-score`): Compatibility score with suggestions
- **Knowledge Base** (`/api/knowledge-base`): GET/PUT user KB

## Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npx playwright test` — Run E2E browser tests
- `npx tsx src/scripts/seed-kb.ts` — Seed Kamal's KB from portfolio data

## Deployment
- **Live**: http://65.1.131.61 (pending domain)
- **SSH**: `ssh kamal`
- **Quick deploy**: `git push && ssh kamal 'cd /projects/resume-builder && git pull && npm install && NODE_OPTIONS="--max-old-space-size=768" npm run build && pm2 restart resume-builder'`
- See `.claude/decisions/deploy.md` for full deployment guide

## .claude Knowledge Base
```
.claude/
├── memory/MEMORY.md          # Always loaded — project overview
├── skills/anthropic-api.md   # CRITICAL — Anthropic API constraints
├── decisions/
│   ├── architecture.md       # Tech decisions
│   ├── patterns.md           # Code patterns
│   └── deploy.md             # Deployment guide
└── ui/design-system.md       # Full UI design system
```
