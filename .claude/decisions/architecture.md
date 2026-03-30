# Architecture Decisions

## Anthropic API Integration
- **Direct fetch, NOT SDK**: User's API uses OAuth bearer tokens which the Anthropic SDK doesn't support
- **Exact headers required** (do not modify):
  - `Authorization: Bearer <ANTHROPIC_OAUTH_TOKEN>`
  - `anthropic-version: 2023-06-01`
  - `anthropic-beta: claude-code-20250219,oauth-2025-04-20,fine-grained-tool-streaming-2025-05-14`
- **System message format**: `[{ "type": "text", "text": "..." }]` (array, not string)
- **Streaming**: Uses SSE (text/event-stream) for chat, non-streaming for generate/tailor/ats

## Database Pattern
- Two separate MongoDB connections:
  1. `src/lib/db.ts` — Native `MongoClient` for Auth.js adapter only
  2. `src/lib/mongoose.ts` — Mongoose for all app data access
- Both cached on `globalThis` to survive Next.js hot reloads

## Auth Pattern
- Auth.js v5 with `auth.ts` at project root (required by Auth.js v5)
- Database session strategy (not JWT) via MongoDBAdapter
- Middleware protects `/dashboard/*`, `/editor/*`, `/preview/*`
- Session includes `user.id` via callback augmentation

## Resume Data Model
- Nested document structure (not referenced)
- Sub-schemas use `{ _id: false }` to avoid unnecessary ObjectIds
- Templates: "classic", "modern", "minimal"
- Chat history stored separately in `ChatHistory` collection per resume

## Frontend Architecture
- Route groups: `(auth)`, `(main)`, `(dashboard)` for different layouts
- Editor page: 3-panel layout (form | preview | AI chat)
- Auto-save with 2-second debounce
- Streaming chat UI with SSE parsing
