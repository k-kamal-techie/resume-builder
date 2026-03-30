export interface ChatSessionSummary {
  _id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  _id: string;
  resumeId: string;
  userId: string;
  title: string;
  messages: ChatSessionMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * List all chat sessions for a resume.
 */
export async function listChatSessions(
  resumeId: string
): Promise<ChatSessionSummary[]> {
  const res = await fetch(`/api/chat-sessions?resumeId=${resumeId}`);
  if (!res.ok) throw new Error(`Failed to list sessions (${res.status})`);
  return res.json();
}

/**
 * Create a new chat session for a resume.
 */
export async function createChatSession(
  resumeId: string,
  title?: string
): Promise<ChatSession> {
  const res = await fetch("/api/chat-sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeId, title }),
  });
  if (!res.ok) throw new Error(`Failed to create session (${res.status})`);
  return res.json();
}

/**
 * Fetch a single chat session with all messages.
 */
export async function fetchChatSession(id: string): Promise<ChatSession> {
  const res = await fetch(`/api/chat-sessions/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch session (${res.status})`);
  return res.json();
}

/**
 * Save messages to a chat session.
 */
export async function saveChatSession(
  id: string,
  data: { messages?: ChatSessionMessage[]; title?: string }
): Promise<ChatSession> {
  const res = await fetch(`/api/chat-sessions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save session (${res.status})`);
  return res.json();
}

/**
 * Delete a chat session.
 */
export async function deleteChatSession(id: string): Promise<void> {
  const res = await fetch(`/api/chat-sessions/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete session (${res.status})`);
}
