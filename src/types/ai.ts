export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicSystemMessage {
  type: "text";
  text: string;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  system: AnthropicSystemMessage[];
  messages: AnthropicMessage[];
  stream: boolean;
}

export interface AnthropicContentBlock {
  type: "text";
  text: string;
}

export interface AnthropicResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: AnthropicContentBlock[];
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface AtsScore {
  overall: number;
  keywordMatch: number;
  skillsAlignment: number;
  formatCompatibility: number;
  contentRelevance: number;
  suggestions: string[];
  missingKeywords: string[];
}

export type AiAction = "chat" | "generate" | "tailor" | "ats-score";
