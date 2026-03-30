"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { ResumeData } from "@/types/resume";
import type { KnowledgeBaseData } from "@/types/knowledge-base";
import { sendChatMessage as sendChatAPI, tailorResume, getAtsScore } from "@/lib/services/ai";
import {
  listChatSessions, createChatSession, fetchChatSession, saveChatSession,
  type ChatSessionSummary,
} from "@/lib/services/chat-session";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LuSend, LuSparkles, LuCheck, LuChevronDown, LuChevronRight, LuBrain, LuPlus, LuMessageSquare, LuLoader } from "react-icons/lu";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  appliedData?: boolean;
  appliedKB?: boolean;
}

interface ChatPanelProps {
  resumeId: string;
  resumeData: ResumeData;
  knowledgeBase?: KnowledgeBaseData | null;
  jobDescription?: string;
  onApplyResumeData: (data: ResumeData) => void;
  onApplyKBData?: (data: KnowledgeBaseData) => void;
  onSave?: () => void;
  onUpdateJD?: (jd: string) => void;
  initialJd?: string;
}

const slashCommands = [
  { command: "/tailor", label: "Tailor for JD", description: "Tailor resume to the saved job description" },
  { command: "/ats", label: "ATS Score", description: "Get ATS compatibility score against saved JD" },
  { command: "/improve", label: "Improve Bullets", description: "Improve bullet points with action verbs" },
  { command: "/summary", label: "Write Summary", description: "Generate a professional summary" },
  { command: "/save", label: "Save Resume", description: "Save the current resume to database" },
  { command: "/jd", label: "Set Job Description", description: "Set or update the job description for this resume" },
];

function extractResumeUpdate(content: string): ResumeData | null {
  // Look for ```resume-json or ```json blocks with personalInfo
  const resumeMatch = content.match(/```(?:resume-json|json)\s*([\s\S]*?)```/);
  if (!resumeMatch) return null;
  try {
    const parsed = JSON.parse(resumeMatch[1]);
    if (parsed && typeof parsed === "object" && parsed.personalInfo) {
      return parsed as ResumeData;
    }
  } catch { /* invalid */ }
  return null;
}

function extractKBUpdate(content: string): KnowledgeBaseData | null {
  const kbMatch = content.match(/```kb-json\s*([\s\S]*?)```/);
  if (!kbMatch) return null;
  try {
    const parsed = JSON.parse(kbMatch[1]);
    if (parsed && typeof parsed === "object" && parsed.profile) {
      return parsed as KnowledgeBaseData;
    }
  } catch { /* invalid */ }
  return null;
}

function MessageContent({
  content, appliedData, appliedKB, onApplyResume, onApplyKB,
}: {
  content: string;
  appliedData?: boolean;
  appliedKB?: boolean;
  onApplyResume?: (data: ResumeData) => void;
  onApplyKB?: (data: KnowledgeBaseData) => void;
}) {
  const [showJson, setShowJson] = useState(false);

  const jsonMatch = content.match(/```(?:resume-json|kb-json|json)\s*([\s\S]*?)```/);
  const displayContent = jsonMatch
    ? (content.substring(0, jsonMatch.index).trim() + "\n\n" + content.substring((jsonMatch.index || 0) + jsonMatch[0].length).trim()).trim()
    : content;

  function handleApply() {
    if (!jsonMatch) return;
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.personalInfo && onApplyResume) {
        onApplyResume(parsed as ResumeData);
      } else if (parsed.profile && onApplyKB) {
        onApplyKB(parsed as KnowledgeBaseData);
      }
    } catch {
      // invalid JSON
    }
  }

  return (
    <>
      <div className="prose prose-sm prose-gray max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_p]:my-1 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-semibold [&_code]:text-xs [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-gray-50 [&_pre]:text-xs [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_blockquote]:border-l-blue-400 [&_blockquote]:text-gray-600 [&_a]:text-accent-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
      </div>
      {jsonMatch && (
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 font-medium"
          >
            {showJson ? <LuChevronDown className="h-3 w-3" /> : <LuChevronRight className="h-3 w-3" />}
            {showJson ? "Hide" : "View"} data
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-1 text-xs text-accent-600 hover:text-blue-800 font-medium px-2 py-0.5 rounded bg-accent-50 hover:bg-accent-100 transition-colors"
          >
            <LuCheck className="h-3 w-3" />
            Apply this version
          </button>
        </div>
      )}
      {showJson && jsonMatch && (
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto max-h-48 overflow-y-auto text-gray-700 font-mono mt-1">
          {jsonMatch[1].trim()}
        </pre>
      )}
      <AppliedBadges appliedData={appliedData} appliedKB={appliedKB} />
    </>
  );
}

function AppliedBadges({ appliedData, appliedKB }: { appliedData?: boolean; appliedKB?: boolean }) {
  if (!appliedData && !appliedKB) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {appliedData && (
        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <LuCheck className="h-3 w-3" />
          Resume updated
        </div>
      )}
      {appliedKB && (
        <div className="flex items-center gap-1 text-xs text-purple-600 font-medium">
          <LuBrain className="h-3 w-3" />
          Knowledge base updated
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({
  resumeId, resumeData, knowledgeBase, jobDescription, onApplyResumeData, onApplyKBData, onSave, onUpdateJD, initialJd,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [jdSent, setJdSent] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [showJdEditor, setShowJdEditor] = useState(false);
  const [jdDraft, setJdDraft] = useState("");
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sessions on mount
  useEffect(() => {
    listChatSessions(resumeId)
      .then((s) => {
        setSessions(s);
        // Auto-load latest session if exists
        if (s.length > 0 && s[0].messageCount > 0) {
          loadSession(s[0]._id);
        }
      })
      .catch(() => {});
  }, [resumeId]);

  // Auto-save messages with debounce
  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveChatSession(activeSessionId, {
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString(),
        })),
      }).catch(console.error);
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [messages, activeSessionId]);

  // Auto-start JD flow
  useEffect(() => {
    if (initialJd && !jdSent && !isLoading) {
      setJdSent(true);
      handleNewSession().then(() => {
        const jdPrompt = `I have a new job description I want to create a resume for. Please analyze it against my knowledge base, identify relevant experience and skills, ask me any clarifying questions, and then build a tailored resume.\n\nJob Description:\n${initialJd}`;
        sendChatMessage(jdPrompt);
      });
    }
  }, [initialJd, jdSent]);

  async function loadSession(sessionId: string) {
    setLoadingSession(true);
    try {
      const session = await fetchChatSession(sessionId);
      setActiveSessionId(session._id);
      setMessages(session.messages.map((m) => ({ role: m.role, content: m.content })));
    } catch {
      console.error("Failed to load session");
    } finally {
      setLoadingSession(false);
    }
  }

  async function renameSession(sessionId: string, title: string) {
    if (!title.trim()) return;
    try {
      await saveChatSession(sessionId, { title });
      setSessions((prev) => prev.map((s) => s._id === sessionId ? { ...s, title } : s));
    } catch {
      console.error("Failed to rename session");
    }
    setRenamingSessionId(null);
  }

  async function handleNewSession() {
    try {
      const session = await createChatSession(resumeId);
      setActiveSessionId(session._id);
      setMessages([]);
      setSessions((prev) => [
        { _id: session._id, title: session.title, messageCount: 0, createdAt: session.createdAt, updatedAt: session.updatedAt },
        ...prev,
      ]);
      setShowSessions(false);
    } catch {
      console.error("Failed to create session");
    }
  }

  function buildEnrichedMessage(messageContent: string): string {
    const parts: string[] = [];

    if (knowledgeBase) {
      const kbSummary = {
        profile: knowledgeBase.profile,
        skills: knowledgeBase.skills.map((s) => `${s.name} (${s.category}, ${s.proficiency}%)`),
        timeline: knowledgeBase.timeline.map((t) => `${t.type}: ${t.title} at ${t.organization} (${t.startDate}-${t.endDate || "present"})`),
        projects: knowledgeBase.projects.map((p) => `${p.name}: ${p.description.substring(0, 100)}`),
        achievements: knowledgeBase.achievements.map((a) => a.title),
      };
      parts.push("[Your Knowledge Base]");
      parts.push(JSON.stringify(kbSummary, null, 2));
      parts.push("");
    }

    parts.push("[Current Resume]");
    parts.push(JSON.stringify(resumeData, null, 2));
    parts.push("");
    parts.push("[Instructions]");
    parts.push("- When updating the resume, output a ```resume-json code block with the COMPLETE updated resume JSON");
    parts.push("- When updating the knowledge base (adding skills, experience, etc.), output a ```kb-json code block with the COMPLETE updated KB JSON");
    parts.push("- You can output both blocks if updating both");
    parts.push("- Ask clarifying questions before making major changes");
    parts.push("- Keep all existing data unless asked to change it");
    parts.push("- Be conversational and interactive — ask about details, quantify achievements");
    parts.push("");
    parts.push("User request: " + messageContent);

    return parts.join("\n");
  }

  async function sendChatMessage(messageContent: string) {
    if (!messageContent.trim() || isLoading) return;

    // Auto-create session if none exists
    if (!activeSessionId) {
      try {
        const session = await createChatSession(resumeId, messageContent.substring(0, 50));
        setActiveSessionId(session._id);
        setSessions((prev) => [
          { _id: session._id, title: session.title, messageCount: 0, createdAt: session.createdAt, updatedAt: session.updatedAt },
          ...prev,
        ]);
      } catch {
        console.error("Failed to create session");
      }
    }

    // Handle "save" command locally
    const lowerMsg = messageContent.trim().toLowerCase();
    if (lowerMsg === "save" || lowerMsg === "save resume" || lowerMsg === "save this resume") {
      if (onSave) {
        onSave();
        setMessages((prev) => [
          ...prev,
          { role: "user", content: messageContent },
          { role: "assistant", content: "Resume saved successfully." },
        ]);
        setInput("");
        return;
      }
    }

    const userMessage: ChatMessage = { role: "user", content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const enrichedMessage = buildEnrichedMessage(messageContent);

    try {
      const response = await sendChatAPI({
        message: enrichedMessage,
        resumeId,
        history: messages.map((m) => ({
          role: m.role,
          content: m.content.replace(/```(?:resume-json|kb-json|json)[\s\S]*?```/g, "[data block]"),
        })),
      });

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

      // Auto-apply: extract resume and KB data from response
      let appliedData = false;
      let appliedKB = false;

      const resumeUpdate = extractResumeUpdate(assistantContent);
      if (resumeUpdate) {
        onApplyResumeData(resumeUpdate);
        appliedData = true;
      }

      const kbUpdate = extractKBUpdate(assistantContent);
      if (kbUpdate && onApplyKBData) {
        onApplyKBData(kbUpdate);
        appliedKB = true;
      }

      if (appliedData || appliedKB) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            appliedData,
            appliedKB,
          };
          return updated;
        });
      }
      // Auto-name session from first user message
      if (activeSessionId && messages.length <= 2) {
        const firstUserMsg = messageContent.substring(0, 50);
        saveChatSession(activeSessionId, { title: firstUserMsg }).catch(() => {});
        setSessions((prev) => prev.map((s) =>
          s._id === activeSessionId ? { ...s, title: firstUserMsg } : s
        ));
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

  async function handleJdAction(action: "tailor" | "ats-score") {
    if (!jobDescription) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "No job description set. Use `/jd` to set one first." },
      ]);
      return;
    }
    setIsLoading(true);
    try {
      const apiCall = action === "tailor" ? tailorResume : getAtsScore;
      const result = await apiCall({ jobDescription, resumeData });
      const content = action === "tailor"
        ? formatTailorResult(result)
        : formatAtsResult(result);

      setMessages((prev) => [
        ...prev,
        { role: "user", content: action === "tailor" ? "/tailor" : "/ats" },
        { role: "assistant", content },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to process. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSlashCommand(command: string) {
    setShowSlashMenu(false);
    setSlashFilter("");

    switch (command) {
      case "/tailor":
        handleJdAction("tailor");
        break;
      case "/ats":
        handleJdAction("ats-score");
        break;
      case "/improve":
        sendChatMessage("Improve my resume bullet points to be more impactful with action verbs and quantified results.");
        break;
      case "/summary":
        sendChatMessage("Write a professional summary based on my knowledge base and resume content.");
        break;
      case "/save":
        if (onSave) {
          onSave();
          setMessages((prev) => [
            ...prev,
            { role: "user", content: "/save" },
            { role: "assistant", content: "Resume saved successfully." },
          ]);
        }
        break;
      case "/jd":
        setJdDraft(jobDescription || "");
        setShowJdEditor(true);
        break;
    }
    setInput("");
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (value.startsWith("/")) {
      setShowSlashMenu(true);
      setSlashFilter(value.toLowerCase());
    } else {
      setShowSlashMenu(false);
      setSlashFilter("");
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <LuSparkles className="h-4 w-4 text-accent-600" />
              AI Resume Assistant
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {knowledgeBase
                ? `KB: ${knowledgeBase.skills.length} skills, ${knowledgeBase.timeline.length} timeline entries`
                : "Chat with Claude to build and edit your resume"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LuMessageSquare className="h-3.5 w-3.5" />
              {sessions.length > 0 ? `${sessions.length} chats` : "Chats"}
            </button>
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1 px-2 py-1 text-xs text-accent-600 hover:text-blue-800 hover:bg-accent-50 rounded-md transition-colors"
              title="New chat session"
            >
              <LuPlus className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>
        {showSessions && sessions.length > 0 && (
          <div className="mt-2 border-t border-gray-100 pt-2 max-h-40 overflow-y-auto space-y-1">
            {sessions.map((s) => (
              <div
                key={s._id}
                className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors flex items-center gap-1 ${
                  activeSessionId === s._id
                    ? "bg-accent-50 text-accent-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {renamingSessionId === s._id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => renameSession(s._id, renameValue)}
                    onKeyDown={(e) => { if (e.key === "Enter") renameSession(s._id, renameValue); if (e.key === "Escape") setRenamingSessionId(null); }}
                    className="flex-1 text-xs bg-white border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-accent-500"
                  />
                ) : (
                  <button
                    onClick={() => { loadSession(s._id); setShowSessions(false); }}
                    onDoubleClick={(e) => { e.stopPropagation(); setRenamingSessionId(s._id); setRenameValue(s.title); }}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="font-medium truncate">{s.title}</div>
                    <div className="text-gray-400">
                      {s.messageCount} msgs · {new Date(s.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JD Modal */}
      {showJdEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowJdEditor(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Job Description</h3>
            <textarea
              autoFocus
              value={jdDraft}
              onChange={(e) => setJdDraft(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[200px]"
              placeholder="Paste the job description here..."
            />
            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="ghost" onClick={() => setShowJdEditor(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => {
                if (onUpdateJD) onUpdateJD(jdDraft);
                setShowJdEditor(false);
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: "Job description saved. Use `/tailor` or `/ats` to analyze against it." },
                ]);
              }}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingSession && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}
        {!loadingSession && messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm mt-12">
            <LuSparkles className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-medium text-gray-500">How can I help with your resume?</p>
            <p className="text-xs mt-2 max-w-sm mx-auto">
              I have access to your knowledge base. Tell me about your experience, ask me to add skills, improve content, or tailor for a job description.
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
                  ? "bg-accent-600 text-white"
                  : "bg-white border border-gray-200 text-gray-800"
              }`}
            >
              {msg.role === "assistant" ? (
                <MessageContent
                  content={msg.content}
                  appliedData={msg.appliedData}
                  appliedKB={msg.appliedKB}
                  onApplyResume={onApplyResumeData}
                  onApplyKB={onApplyKBData}
                />
              ) : (
                <span className="whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-500">
              <LuLoader className="h-3.5 w-3.5 animate-spin text-accent-500" />
              {messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content
                ? "Writing..."
                : "Thinking..."}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Slash Command Menu */}
      {showSlashMenu && (
        <div className="border-t border-gray-200 bg-white px-3 py-2 shrink-0">
          <div className="space-y-0.5">
            {slashCommands
              .filter((cmd) => !slashFilter || cmd.command.startsWith(slashFilter))
              .map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => handleSlashCommand(cmd.command)}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent-50 transition-colors flex items-center gap-3"
                >
                  <span className="text-xs font-mono text-accent-600 font-semibold w-16">{cmd.command}</span>
                  <span className="text-xs text-gray-600">{cmd.description}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (showSlashMenu) {
                  const match = slashCommands.find((cmd) => cmd.command === input.trim());
                  if (match) {
                    handleSlashCommand(match.command);
                    return;
                  }
                }
                sendChatMessage(input);
              }
              if (e.key === "Escape") {
                setShowSlashMenu(false);
              }
            }}
            placeholder="Type / for commands, or ask anything..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
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
