import { AnthropicMessage, AnthropicSystemMessage, AnthropicResponse } from "@/types/ai";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_MESSAGE: AnthropicSystemMessage[] = [
  {
    type: "text",
    text: "You are Claude Code, Anthropic's official CLI for Claude.",
  },
];

function getHeaders(userApiKey?: string): Record<string, string> {
  const key = userApiKey || process.env.ANTHROPIC_OAUTH_TOKEN;
  if (!key) {
    throw new Error("No Anthropic API key configured. Please add your API key in Settings.");
  }

  const base: Record<string, string> = {
    "anthropic-version": "2023-06-01",
    "Content-Type": "application/json",
  };

  // OAuth tokens (sk-ant-oat...) use Bearer auth + beta flags
  if (key.startsWith("sk-ant-oat")) {
    return {
      ...base,
      Authorization: `Bearer ${key}`,
      "anthropic-beta":
        "claude-code-20250219,oauth-2025-04-20,fine-grained-tool-streaming-2025-05-14",
    };
  }

  // Standard API keys use x-api-key header
  return { ...base, "x-api-key": key };
}

function buildMessages(
  systemPrompt: string | undefined,
  messages: AnthropicMessage[]
): AnthropicMessage[] {
  if (!systemPrompt) return messages;

  // Prepend the per-route system prompt as context in the first user message
  const [first, ...rest] = messages;
  if (first && first.role === "user") {
    return [
      { role: "user", content: `[Instructions]\n${systemPrompt}\n\n${first.content}` },
      ...rest,
    ];
  }
  return messages;
}

export async function sendMessage({
  system,
  messages,
  model,
  maxTokens = 4096,
  apiKey,
}: {
  system?: string;
  messages: AnthropicMessage[];
  model?: string;
  maxTokens?: number;
  apiKey?: string;
}): Promise<AnthropicResponse> {
  const resolvedModel = model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const body = {
    model: resolvedModel,
    max_tokens: maxTokens,
    system: SYSTEM_MESSAGE,
    messages: buildMessages(system, messages),
    stream: false,
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  return response.json();
}

export async function streamMessage({
  system,
  messages,
  model,
  maxTokens = 4096,
  apiKey,
}: {
  system?: string;
  messages: AnthropicMessage[];
  model?: string;
  maxTokens?: number;
  apiKey?: string;
}): Promise<Response> {
  const resolvedModel = model || process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const body = {
    model: resolvedModel,
    max_tokens: maxTokens,
    system: SYSTEM_MESSAGE,
    messages: buildMessages(system, messages),
    stream: true,
  };

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${error}`);
  }

  return response;
}
