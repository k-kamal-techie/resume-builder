# Agentic Resume — Project Memory

## Project Identity
- **Name**: Agentic Resume (was: ResumeAI)
- **Type**: Personal agentic AI resume builder
- **Owner**: Kamal Kumar — k.kamal.techie@gmail.com
- **Started**: 2026-03-28
- **Live**: http://65.1.131.61 (domain pending: resume-builder.psyduck.in)

## User Preferences
- Prefers comprehensive planning before implementation (use EnterPlanMode)
- Wants all choices discussed upfront — tech stack, features, architecture
- Likes full-featured implementations, not minimal stubs
- Uses Anthropic API with OAuth bearer token — NOT the SDK
- Prefers Claude Opus 4 model (`claude-opus-4-6`)
- Wants Claude to learn patterns across sessions
- Prefers reusable service functions over inline fetch calls
- Explicit save only in editor (no auto-save)
- Documentation must stay current — update CLAUDE.md, README.md, and .claude/ files after every major feature

## .claude Directory Structure
```
.claude/
├── memory/MEMORY.md          ← this file, always loaded
├── skills/
│   └── anthropic-api.md      ← CRITICAL: locked system message, headers, OAuth
├── decisions/
│   ├── architecture.md       ← tech decisions, data models
│   ├── patterns.md           ← code conventions
│   └── deploy.md             ← AWS EC2 deployment guide
└── ui/
    └── design-system.md      ← full UI spec (colors, layout, components)
```

## Key Constraints (Do Not Violate)
- **Anthropic system message** must be EXACTLY: `"You are Claude Code, Anthropic's official CLI for Claude."` — see `.claude/skills/anthropic-api.md`
- **No auto-save** in editor — save only on explicit Save button or `/save` command
- **No `blue-*` Tailwind classes** in UI components — use `accent-*` CSS variable classes
- **No top navbar** — navigation lives entirely in `AppSidebar` (`src/components/layout/app-sidebar.tsx`)
- **Service layer** — all client API calls go through `src/lib/services/`

## Deployment
- **SSH alias**: `ssh kamal` (key: `/Users/kamalkumar/Downloads/kamal.pem`)
- **Quick deploy**: `git push && ssh kamal 'cd /projects/resume-builder && git pull && npm install && NODE_OPTIONS="--max-old-space-size=768" npm run build && pm2 restart resume-builder'`
- **GitHub**: https://github.com/k-kamal-techie/resume-builder (account: k-kamal-techie)
- Switch GH account: `gh auth switch --user k-kamal-techie`

## Current Architecture Summary
- **Layout**: Dark AppSidebar (w-60 bg-slate-900) + content area — no top navbar
- **Editor**: AppSidebar + ChatPanel (flex-1) + PreviewPanel (w-420px)
- **Chat**: Agentic — KB context + resume context injected on every message
- **Slash commands**: /tailor /ats /improve /summary /save /jd
- **Chat sessions**: Multiple per resume, auto-named, auto-saved, rename on double-click
- **Knowledge Base**: MongoDB `knowledgebases` collection, seeded from portfolio
- **Theme**: CSS variables (--accent-50 to --accent-700), 7 presets, localStorage
