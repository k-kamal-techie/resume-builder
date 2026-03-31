# Agentic Resume

An AI-first resume builder powered by Claude. Chat with an AI agent to build, tailor, and optimize your resume. Backed by a Personal Knowledge Base that stores your entire professional life.

## Features

| Feature | Description |
|---|---|
| **Agentic AI Chat** | Chat with Claude to build and edit your resume. The agent asks questions, updates both the resume and knowledge base, and auto-applies changes with undo. |
| **Personal Knowledge Base** | One persistent document per user — stores all skills, timeline, projects, and achievements. Seeded from portfolio data. Used as context in every chat. |
| **Slash Commands** | `/tailor`, `/ats`, `/improve`, `/summary`, `/save`, `/jd` — quick agent commands from the chat input. |
| **Live Preview** | Resume preview updates in real-time as the AI applies changes. Toggle to JSON editor for manual edits. |
| **Multi-Session Chat** | Multiple chat sessions per resume. Auto-named, auto-saved, inline rename. |
| **Theme Selector** | 7 accent color presets (Blue, Purple, Green, Teal, Orange, Rose, Indigo). Persists across sessions. |
| **Resume Templates** | Classic, Modern, and Minimal templates. |
| **ATS Scoring** | Get ATS compatibility score against a saved job description. |
| **Job Tailoring** | Tailor your resume to a specific JD stored per resume. |

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 — CSS-first, accent color via CSS variables
- **Database**: MongoDB Atlas + Mongoose
- **Auth**: Auth.js v5 — Google OAuth + MongoDBAdapter
- **AI**: Anthropic Messages API (Claude Opus) via OAuth bearer token
- **Process Manager**: PM2 (production)
- **Reverse Proxy**: Nginx

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
MONGODB_URI=                  # MongoDB Atlas connection string
NEXTAUTH_URL=                 # http://localhost:3000 (or your domain)
NEXTAUTH_SECRET=              # openssl rand -base64 32
AUTH_TRUST_HOST=              # true (production only)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
ANTHROPIC_OAUTH_TOKEN=        # sk-ant-oat01-...
ANTHROPIC_MODEL=              # claude-opus-4-6
NEXT_PUBLIC_APP_URL=          # http://localhost:3000
```

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx playwright test` | E2E browser tests |
| `npx tsx src/scripts/seed-kb.ts` | Seed knowledge base |

## Deployment

See [`.claude/decisions/deploy.md`](.claude/decisions/deploy.md) for the full deployment guide.

**Quick deploy after code changes:**
```bash
git push && ssh kamal 'cd /projects/resume-builder && git pull && npm install && NODE_OPTIONS="--max-old-space-size=768" npm run build && pm2 restart resume-builder'
```

## Project Structure

```
src/
├── app/(auth)/       # Login page
├── app/(main)/       # Landing, templates (public)
├── app/(dashboard)/  # Dashboard, knowledge base (authenticated)
├── app/(editor)/     # Resume editor, preview (full-screen)
├── app/api/          # REST API + AI endpoints
├── components/
│   ├── ai/           # chat-panel.tsx — main AI interface
│   ├── layout/       # app-sidebar.tsx (dark sidebar)
│   ├── resume/       # preview-panel, json-editor, resume-preview
│   ├── templates/    # classic, modern, minimal
│   └── ui/           # button, card, input, modal, loading-spinner
├── lib/services/     # Client-side API service layer
├── models/           # Mongoose models
└── scripts/          # seed-kb.ts
```
