# Anthropic API — Constraints & Requirements

## CRITICAL: OAuth Token Requirements

The Anthropic API is accessed via **OAuth bearer token** (NOT the Anthropic SDK). The OAuth token imposes strict requirements on the request format. **Do NOT deviate from this format.**

## Exact Request Format

### Headers (MUST be exact)
```
Authorization: Bearer <ANTHROPIC_OAUTH_TOKEN from .env.local>
anthropic-version: 2023-06-01
anthropic-beta: claude-code-20250219,oauth-2025-04-20,fine-grained-tool-streaming-2025-05-14
Content-Type: application/json
```

### System Message (MANDATORY — DO NOT CHANGE)
The `system` field MUST always be this exact value:
```json
[
  {
    "type": "text",
    "text": "You are Claude Code, Anthropic's official CLI for Claude."
  }
]
```

**This is NOT customizable.** The OAuth token requires this specific system message. Changing it to anything else causes a `400 invalid_request_error`.

### Request Body Structure
```json
{
  "model": "claude-opus-4-6",
  "max_tokens": 4096,
  "system": [{ "type": "text", "text": "You are Claude Code, Anthropic's official CLI for Claude." }],
  "messages": [{ "role": "user", "content": "..." }],
  "stream": true
}
```

## How to Handle Per-Route Prompts

Since the `system` field is locked, per-route prompts (resume writer, career coach, etc.) must be injected into the **user messages** — NOT the system field.

The helper in `src/lib/anthropic.ts` does this via `buildMessages()`:
- Accepts an optional `system` param (the per-route prompt)
- Prepends it as `[Instructions]\n{prompt}` in the first user message
- The actual `system` field always uses the mandatory OAuth system message

## Implementation: `src/lib/anthropic.ts`

- `SYSTEM_MESSAGE` constant — the locked system message array
- `getHeaders()` — returns exact required headers
- `buildMessages(systemPrompt, messages)` — injects per-route prompts into user messages
- `sendMessage()` — non-streaming POST
- `streamMessage()` — streaming POST returning raw Response body for SSE

## Key Rules

1. **NEVER modify the system message text** — not a single word
2. **NEVER modify the headers** — they must match exactly
3. **NEVER use the Anthropic SDK** — it doesn't support OAuth tokens
4. **Per-route prompts go in user messages**, not in the system field
5. **Model is configurable** via `ANTHROPIC_MODEL` env var (default: `claude-opus-4-6`)
6. **OAuth tokens expire** — if you get `400 invalid_request_error` with message "Error", the token likely needs refreshing in `.env.local`
7. **System message format** is always an array of objects: `[{ "type": "text", "text": "..." }]`
