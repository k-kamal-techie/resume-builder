# ResumeAI

AI-powered resume builder using Claude to generate, tailor, and optimize resume content.

## Features

- **AI Chat Editor** — Two-panel layout with AI chat (70%) and live preview (30%). Chat with Claude to build and edit your resume conversationally. Changes are auto-applied with undo support.
- **JSON Editor** — Toggle the preview panel to a JSON editor for direct manual editing of resume data.
- **Resume Templates** — Classic, Modern, and Minimal templates with live preview.
- **Job Tailoring** — Paste a job description and get suggestions to tailor your resume.
- **ATS Scoring** — Get ATS compatibility scores with keyword analysis and improvement suggestions.
- **Google OAuth** — Sign in with Google (GitHub OAuth optional).

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB + Mongoose
- **Auth**: Auth.js v5 with Google OAuth + MongoDBAdapter
- **AI**: Anthropic Messages API (Claude Opus) via OAuth bearer token
- **Testing**: Playwright (E2E)

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```
MONGODB_URI=              # MongoDB connection string
NEXTAUTH_URL=             # http://localhost:3000
NEXTAUTH_SECRET=          # Generate with: openssl rand -base64 32
GOOGLE_CLIENT_ID=         # Google OAuth client ID
GOOGLE_CLIENT_SECRET=     # Google OAuth client secret
ANTHROPIC_OAUTH_TOKEN=    # Anthropic API OAuth bearer token
ANTHROPIC_MODEL=          # Default: claude-opus-4-6
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npx playwright test` | Run E2E tests |
