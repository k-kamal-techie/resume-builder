"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { ResumeData } from "@/types/resume";
import { LuSend, LuSparkles, LuFileText, LuTarget, LuChartBar, LuCheck, LuChevronDown, LuChevronRight } from "react-icons/lu";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  appliedData?: boolean;
}

interface ChatPanelProps {
  resumeId: string;
  resumeData: ResumeData;
  onApplyResumeData: (data: ResumeData) => void;
}

const quickActions = [
  { label: "Improve bullets", icon: LuSparkles, prompt: "Improve my resume bullet points to be more impactful with action verbs and quantified results." },
  { label: "Write summary", icon: LuFileText, prompt: "Write a professional summary based on my resume content." },
  { label: "Tailor for JD", icon: LuTarget, action: "tailor" },
  { label: "ATS Score", icon: LuChartBar, action: "ats-score" },
];

function extractResumeData(content: string): ResumeData | null {
  const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (!jsonBlockMatch) return null;

  try {
    const parsed = JSON.parse(jsonBlockMatch[1]);
    if (parsed && typeof parsed === "object" && parsed.personalInfo) {
      return parsed as ResumeData;
    }
  } catch {
    // invalid JSON
  }
  return null;
}

function MessageContent({ content, appliedData }: { content: string; appliedData?: boolean }) {
  const [showJson, setShowJson] = useState(false);

  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (!jsonMatch) {
    return (
      <>
        <span className="whitespace-pre-wrap">{content}</span>
        {appliedData && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
            <LuCheck className="h-3 w-3" />
            Changes applied to resume
          </div>
        )}
      </>
    );
  }

  const beforeJson = content.substring(0, jsonMatch.index).trim();
  const afterJson = content.substring((jsonMatch.index || 0) + jsonMatch[0].length).trim();

  return (
    <>
      {beforeJson && <span className="whitespace-pre-wrap">{beforeJson}</span>}
      <button
        onClick={() => setShowJson(!showJson)}
        className="flex items-center gap-1 mt-2 mb-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
      >
        {showJson ? <LuChevronDown className="h-3 w-3" /> : <LuChevronRight className="h-3 w-3" />}
        {showJson ? "Hide" : "View"} resume data
      </button>
      {showJson && (
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto text-gray-700 font-mono mt-1">
          {jsonMatch[1].trim()}
        </pre>
      )}
      {afterJson && <span className="whitespace-pre-wrap mt-1 block">{afterJson}</span>}
      {appliedData && (
        <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
          <LuCheck className="h-3 w-3" />
          Changes applied to resume
        </div>
      )}
    </>
  );
}

export default function ChatPanel({ resumeId, resumeData, onApplyResumeData }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [showJdInput, setShowJdInput] = useState(false);
  const [jdAction, setJdAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendChatMessage(messageContent: string) {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Enrich message with current resume data and format instructions (hidden from chat UI)
    const resumeJson = JSON.stringify(resumeData, null, 2);
    const enrichedMessage = [
      "Here is my current resume data as JSON:",
      resumeJson,
      "",
      "When you make changes, output the COMPLETE updated resume JSON in a ```json code block. Keep all existing data unless I ask to change it.",
      "",
      "My request: " + messageContent,
    ].join("\n");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: enrichedMessage,
          resumeId,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content.replace(/```json[\s\S]*?```/g, "[resume data]"),
          })),
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        console.error("Chat API error:", response.status, errBody);
        throw new Error(`API error (${response.status}): ${errBody.slice(0, 200)}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                  assistantContent += parsed.delta.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip non-JSON lines
              }
            }
          }
        }
      }

      // Auto-apply: extract resume data from response
      const extractedData = extractResumeData(assistantContent);
      if (extractedData) {
        onApplyResumeData(extractedData);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            appliedData: true,
          };
          return updated;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errMsg = error instanceof Error ? error.message : "Unknown error";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJdAction() {
    if (!jobDescription.trim()) return;
    setShowJdInput(false);
    setIsLoading(true);

    try {
      const endpoint = jdAction === "tailor" ? "/api/ai/tailor" : "/api/ai/ats-score";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription, resumeData }),
      });

      if (!response.ok) throw new Error("Request failed");

      const result = await response.json();
      const content =
        jdAction === "tailor"
          ? formatTailorResult(result)
          : formatAtsResult(result);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: `[${jdAction === "tailor" ? "Tailor Resume" : "ATS Score"}] for job description` },
        { role: "assistant", content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to process. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
      setJobDescription("");
      setJdAction(null);
    }
  }

  function handleQuickAction(action: (typeof quickActions)[number]) {
    if (action.action) {
      setJdAction(action.action);
      setShowJdInput(true);
    } else if (action.prompt) {
      sendChatMessage(action.prompt);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <LuSparkles className="h-4 w-4 text-blue-600" />
          AI Resume Assistant
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Chat with Claude to build and edit your resume</p>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-b border-gray-200 flex gap-2 flex-wrap shrink-0">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => handleQuickAction(action)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors disabled:opacity-50"
          >
            <action.icon className="h-3 w-3" />
            {action.label}
          </button>
        ))}
      </div>

      {/* JD Input */}
      {showJdInput && (
        <div className="p-3 border-b border-gray-200 bg-blue-50 shrink-0">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Paste the job description:
          </p>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full rounded-lg border border-blue-200 p-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            placeholder="Paste job description here..."
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleJdAction} disabled={!jobDescription.trim()}>
              Analyze
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowJdInput(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-12">
            <LuSparkles className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-medium text-gray-500">How can I help with your resume?</p>
            <p className="text-xs mt-2 max-w-sm mx-auto">
              Tell me about your experience, ask me to add skills, improve bullets, write a summary, or tailor for a job description.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              {msg.role === "assistant" ? (
                <MessageContent content={msg.content} appliedData={msg.appliedData} />
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage(input);
              }
            }}
            placeholder="Ask AI to edit your resume..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            size="md"
            onClick={() => sendChatMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <LuSend className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatTailorResult(result: Record<string, unknown>): string {
  if (result.content) return result.content as string;
  let text = `## Resume Tailoring Results\n\n`;
  text += `**Match Score:** ${result.matchScore}/100\n\n`;
  if (result.tailoredSummary) {
    text += `### Tailored Summary\n${result.tailoredSummary}\n\n`;
  }
  if (Array.isArray(result.suggestions)) {
    text += `### Suggestions\n`;
    for (const s of result.suggestions as Array<{ section: string; suggested: string; reason: string }>) {
      text += `- **${s.section}**: ${s.suggested} _(${s.reason})_\n`;
    }
    text += "\n";
  }
  if (Array.isArray(result.missingKeywords) && (result.missingKeywords as string[]).length > 0) {
    text += `### Missing Keywords\n${(result.missingKeywords as string[]).join(", ")}\n`;
  }
  return text;
}

function formatAtsResult(result: Record<string, unknown>): string {
  if (result.content) return result.content as string;
  let text = `## ATS Compatibility Score\n\n`;
  text += `**Overall: ${result.overall}/100**\n\n`;
  text += `| Category | Score |\n|----------|-------|\n`;
  text += `| Keyword Match | ${result.keywordMatch}/100 |\n`;
  text += `| Skills Alignment | ${result.skillsAlignment}/100 |\n`;
  text += `| Format | ${result.formatCompatibility}/100 |\n`;
  text += `| Content Relevance | ${result.contentRelevance}/100 |\n\n`;
  if (Array.isArray(result.suggestions)) {
    text += `### Improvements\n`;
    for (const s of result.suggestions as string[]) {
      text += `- ${s}\n`;
    }
    text += "\n";
  }
  if (Array.isArray(result.missingKeywords) && (result.missingKeywords as string[]).length > 0) {
    text += `### Missing Keywords\n${(result.missingKeywords as string[]).join(", ")}\n`;
  }
  return text;
}
