# Resume Builder Project Memory

## Project Identity
- **Name**: ResumeAI
- **Type**: Personal AI-powered resume builder
- **Owner**: Kamal Kumar
- **Started**: 2026-03-28

## User Preferences
- Prefers comprehensive planning before implementation
- Wants all choices discussed upfront (tech stack, features, architecture)
- Likes the "All of the above" approach — wants full-featured implementations
- Uses Anthropic API with OAuth bearer token (NOT Anthropic SDK) — the SDK doesn't support OAuth tokens
- Prefers Claude Opus 4 model for AI features
- Wants Claude to learn project patterns and preferences across sessions
- Prefers creating reusable tools/services for repetitive operations

## .claude Directory Structure
```
.claude/
├── memory/          # Project overview and session context
│   └── MEMORY.md    # This file — always loaded
├── skills/          # Reusable API/tech knowledge
│   ├── anthropic-api.md  # CRITICAL — Anthropic OAuth constraints
│   └── README.md
├── decisions/       # Architecture and deployment decisions
│   ├── architecture.md
│   ├── patterns.md
│   ├── deploy.md
│   └── README.md
├── ui/              # UI guidelines and design system
│   ├── design-system.md
│   └── README.md
├── settings.json    # Shared Claude Code settings
└── settings.local.json  # Local-only (gitignored)
```

## Key References
- **Skills**: See [../skills/anthropic-api.md](../skills/anthropic-api.md) — CRITICAL for all Anthropic API calls
- **Architecture**: See [../decisions/architecture.md](../decisions/architecture.md)
- **Patterns**: See [../decisions/patterns.md](../decisions/patterns.md)
- **Deployment**: See [../decisions/deploy.md](../decisions/deploy.md)
- **UI System**: See [../ui/design-system.md](../ui/design-system.md)

## Deployment
- **Live**: http://65.1.131.61
- **SSH**: `ssh kamal` (alias configured)
- **Quick deploy**: `git push && ssh kamal 'cd /projects/resume-builder && git pull && npm install && NODE_OPTIONS="--max-old-space-size=768" npm run build && pm2 restart resume-builder'`
- **GitHub**: https://github.com/k-kamal-techie/resume-builder.git (account: k-kamal-techie)

## Active Development Areas
- Knowledge Base + Agentic AI chat implemented
- Theme selector with 7 accent color presets
- Slash commands (/tailor, /ats, /improve, /summary, /save, /jd)
- Chat sessions with persistence, auto-naming, rename
- Deployed to AWS EC2
