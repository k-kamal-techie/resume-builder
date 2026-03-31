"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  LuSend, LuCheck, LuChevronDown, LuChevronRight, LuBrain,
  LuPlus, LuMessageSquare, LuLoader, LuUser, LuPaperclip, LuBot,
} from "react-icons/lu";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  appliedData?: boolean;
  appliedKB?: boolean;
  timestamp?: string;
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
  { command: "/tailor", description: "Tailor resume to the saved job description" },
  { command: "/ats",    description: "Get ATS compatibility score against saved JD" },
  { command: "/improve",description: "Improve bullet points with action verbs" },
  { command: "/summary",description: "Generate a professional summary" },
  { command: "/save",   description: "Save the current resume to database" },
  { command: "/jd",     description: "Set or update the job description for this resume" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractResumeUpdate(content: string): ResumeData | null {
  const m = content.match(/```(?:resume-json|json)\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    const p = JSON.parse(m[1]);
    if (p?.personalInfo) return p as ResumeData;
  } catch { /* invalid */ }
  return null;
}

function extractKBUpdate(content: string): KnowledgeBaseData | null {
  const m = content.match(/```kb-json\s*([\s\S]*?)```/);
  if (!m) return null;
  try {
    const p = JSON.parse(m[1]);
    if (p?.profile) return p as KnowledgeBaseData;
  } catch { /* invalid */ }
  return null;
}

function formatTime(ts?: string) {
  if (!ts) return "";
  try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  catch { return ""; }
}

// ─── Agent Avatar ─────────────────────────────────────────────────────────────

function AgentAvatar() {
  return (
    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
      <LuBot className="h-4 w-4 text-white" />
    </div>
  );
}

function UserAvatar({ src, name }: { src?: string | null; name?: string | null }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={name || ""} referrerPolicy="no-referrer" onError={() => setErr(true)}
      className="h-8 w-8 rounded-full object-cover shrink-0" />;
  }
  return (
    <div className="h-8 w-8 rounded-full bg-accent-600 flex items-center justify-center shrink-0">
      <LuUser className="h-4 w-4 text-white" />
    </div>
  );
}

// ─── Message Content ──────────────────────────────────────────────────────────

function MessageContent({
  content, appliedData, appliedKB, onApplyResume, onApplyKB,
}: {
  content: string;
  appliedData?: boolean;
  appliedKB?: boolean;
  onApplyResume?: (d: ResumeData) => void;
  onApplyKB?: (d: KnowledgeBaseData) => void;
}) {
  const [showJson, setShowJson] = useState(false);

  const jsonMatch = content.match(/```(?:resume-json|kb-json|json)\s*([\s\S]*?)```/);
  const displayContent = jsonMatch
    ? (content.substring(0, jsonMatch.index).trim() + "\n\n" + content.substring((jsonMatch.index || 0) + jsonMatch[0].length).trim()).trim()
    : content;

  function handleApply() {
    if (!jsonMatch) return;
    try {
      const p = JSON.parse(jsonMatch[1]);
      if (p.personalInfo && onApplyResume) onApplyResume(p as ResumeData);
      else if (p.profile && onApplyKB) onApplyKB(p as KnowledgeBaseData);
    } catch { /* invalid */ }
  }

  return (
    <div>
      <div className="prose prose-sm max-w-none text-slate-700
        [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
        [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_p]:my-1
        [&_h2]:text-sm [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-semibold
        [&_code]:text-xs [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
        [&_pre]:bg-slate-50 [&_pre]:text-xs [&_pre]:p-2 [&_pre]:rounded [&_pre]:overflow-x-auto
        [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1
        [&_strong]:text-slate-900 [&_a]:text-accent-600">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
      </div>

      {/* Data change controls */}
      {jsonMatch && (
        <div className="flex items-center gap-2 mt-2.5">
          <button onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors">
            {showJson ? <LuChevronDown className="h-3 w-3" /> : <LuChevronRight className="h-3 w-3" />}
            {showJson ? "Hide" : "View"} changes
          </button>
          <button onClick={handleApply}
            className="flex items-center gap-1 text-xs text-accent-600 font-medium px-2 py-0.5 rounded-full bg-accent-50 hover:bg-accent-100 transition-colors">
            <LuCheck className="h-3 w-3" />
            Apply this version
          </button>
        </div>
      )}
      {showJson && jsonMatch && (
        <pre className="mt-2 text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-x-auto max-h-48 overflow-y-auto text-slate-600 font-mono">
          {jsonMatch[1].trim()}
        </pre>
      )}

      {/* Applied badges */}
      {(appliedData || appliedKB) && (
        <div className="flex flex-wrap gap-2 mt-2">
          {appliedData && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
              <LuCheck className="h-3 w-3" /> Resume updated
            </span>
          )}
          {appliedKB && (
            <span className="flex items-center gap-1 text-[11px] text-violet-600 font-medium">
              <LuBrain className="h-3 w-3" /> Knowledge base updated
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ChatPanel({
  resumeId, resumeData, knowledgeBase, jobDescription,
  onApplyResumeData, onApplyKBData, onSave, onUpdateJD, initialJd,
}: ChatPanelProps) {
  const { data: session } = useSession();
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    listChatSessions(resumeId).then((s) => {
      setSessions(s);
      if (s.length > 0 && s[0].messageCount > 0) loadSession(s[0]._id);
    }).catch(() => {});
  }, [resumeId]);

  useEffect(() => {
    if (!activeSessionId || messages.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveChatSession(activeSessionId, {
        messages: messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp || new Date().toISOString() })),
      }).catch(console.error);
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [messages, activeSessionId]);

  useEffect(() => {
    if (initialJd && !jdSent && !isLoading) {
      setJdSent(true);
      handleNewSession().then(() => {
        sendChatMessage(`I have a new job description I want to create a resume for. Please analyze it against my knowledge base, identify relevant experience and skills, ask me any clarifying questions, and then build a tailored resume.\n\nJob Description:\n${initialJd}`);
      });
    }
  }, [initialJd, jdSent]);

  async function loadSession(sessionId: string) {
    setLoadingSession(true);
    try {
      const s = await fetchChatSession(sessionId);
      setActiveSessionId(s._id);
      setMessages(s.messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })));
    } catch { console.error("Failed to load session"); }
    finally { setLoadingSession(false); }
  }

  async function renameSession(sessionId: string, title: string) {
    if (!title.trim()) return;
    try {
      await saveChatSession(sessionId, { title });
      setSessions((prev) => prev.map((s) => s._id === sessionId ? { ...s, title } : s));
    } catch { console.error("Failed to rename"); }
    setRenamingSessionId(null);
  }

  async function handleNewSession() {
    try {
      const s = await createChatSession(resumeId);
      setActiveSessionId(s._id);
      setMessages([]);
      setSessions((prev) => [{ _id: s._id, title: s.title, messageCount: 0, createdAt: s.createdAt, updatedAt: s.updatedAt }, ...prev]);
      setShowSessions(false);
    } catch { console.error("Failed to create session"); }
  }

  function buildEnrichedMessage(msg: string): string {
    const parts: string[] = [];
    if (knowledgeBase) {
      const kbSummary = {
        profile: knowledgeBase.profile,
        skills: knowledgeBase.skills.map((s) => `${s.name} (${s.category}, ${s.proficiency}%)`),
        timeline: knowledgeBase.timeline.map((t) => `${t.type}: ${t.title} at ${t.organization} (${t.startDate}-${t.endDate || "present"})`),
        projects: knowledgeBase.projects.map((p) => `${p.name}: ${p.description.substring(0, 100)}`),
        achievements: knowledgeBase.achievements.map((a) => a.title),
      };
      parts.push("[Your Knowledge Base]", JSON.stringify(kbSummary, null, 2), "");
    }
    parts.push("[Current Resume]", JSON.stringify(resumeData, null, 2), "",
      "[Instructions]",
      "- When updating the resume, output a ```resume-json code block with the COMPLETE updated resume JSON",
      "- When updating the knowledge base, output a ```kb-json code block with the COMPLETE updated KB JSON",
      "- You can output both blocks if updating both",
      "- Ask clarifying questions before making major changes",
      "- Be conversational and interactive — ask about details, quantify achievements",
      "",
      "User request: " + msg,
    );
    return parts.join("\n");
  }

  async function sendChatMessage(messageContent: string) {
    if (!messageContent.trim() || isLoading) return;

    // Auto-create session
    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const s = await createChatSession(resumeId, messageContent.substring(0, 50));
        sessionId = s._id;
        setActiveSessionId(s._id);
        setSessions((prev) => [{ _id: s._id, title: s.title, messageCount: 0, createdAt: s.createdAt, updatedAt: s.updatedAt }, ...prev]);
      } catch { console.error("Failed to create session"); }
    }

    // Local "save" command
    const lower = messageContent.trim().toLowerCase();
    if (lower === "save" || lower === "save resume" || lower === "save this resume") {
      if (onSave) {
        onSave();
        setMessages((prev) => [...prev,
          { role: "user", content: messageContent, timestamp: new Date().toISOString() },
          { role: "assistant", content: "Resume saved successfully.", timestamp: new Date().toISOString() },
        ]);
        setInput("");
        return;
      }
    }

    const ts = new Date().toISOString();
    setMessages((prev) => [...prev, { role: "user", content: messageContent, timestamp: ts }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatAPI({
        message: buildEnrichedMessage(messageContent),
        resumeId,
        history: messages.map((m) => ({
          role: m.role,
          content: m.content.replace(/```(?:resume-json|kb-json|json)[\s\S]*?```/g, "[data block]"),
        })),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      const replyTs = new Date().toISOString();

      setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: replyTs }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta" && parsed.delta?.text) {
                assistantContent += parsed.delta.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantContent };
                  return updated;
                });
              }
            } catch { /* skip */ }
          }
        }
      }

      let appliedData = false, appliedKB = false;
      const ru = extractResumeUpdate(assistantContent);
      if (ru) { onApplyResumeData(ru); appliedData = true; }
      const ku = extractKBUpdate(assistantContent);
      if (ku && onApplyKBData) { onApplyKBData(ku); appliedKB = true; }
      if (appliedData || appliedKB) {
        setMessages((prev) => {
          const u = [...prev];
          u[u.length - 1] = { ...u[u.length - 1], appliedData, appliedKB };
          return u;
        });
      }

      // Auto-name
      if (sessionId && messages.length <= 2) {
        const title = messageContent.substring(0, 50);
        saveChatSession(sessionId, { title }).catch(() => {});
        setSessions((prev) => prev.map((s) => s._id === sessionId ? { ...s, title } : s));
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errMsg}`, timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJdAction(action: "tailor" | "ats-score") {
    if (!jobDescription) {
      setMessages((prev) => [...prev, { role: "assistant", content: "No job description set. Use `/jd` to set one first.", timestamp: new Date().toISOString() }]);
      return;
    }
    setIsLoading(true);
    try {
      const apiCall = action === "tailor" ? tailorResume : getAtsScore;
      const result = await apiCall({ jobDescription, resumeData });
      const content = action === "tailor" ? formatTailorResult(result) : formatAtsResult(result);
      const ts = new Date().toISOString();
      setMessages((prev) => [...prev,
        { role: "user", content: action === "tailor" ? "/tailor" : "/ats", timestamp: ts },
        { role: "assistant", content, timestamp: ts },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Failed to process. Please try again.", timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
  }

  function handleSlashCommand(command: string) {
    setShowSlashMenu(false); setSlashFilter(""); setInput("");
    switch (command) {
      case "/tailor": handleJdAction("tailor"); break;
      case "/ats": handleJdAction("ats-score"); break;
      case "/improve": sendChatMessage("Improve my resume bullet points to be more impactful with action verbs and quantified results."); break;
      case "/summary": sendChatMessage("Write a professional summary based on my knowledge base and resume content."); break;
      case "/save": if (onSave) { onSave(); setMessages((prev) => [...prev, { role: "user", content: "/save", timestamp: new Date().toISOString() }, { role: "assistant", content: "Resume saved successfully.", timestamp: new Date().toISOString() }]); } break;
      case "/jd": setJdDraft(jobDescription || ""); setShowJdEditor(true); break;
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    if (value.startsWith("/")) { setShowSlashMenu(true); setSlashFilter(value.toLowerCase()); }
    else { setShowSlashMenu(false); setSlashFilter(""); }
  }

  // ─── Status chips ────────────────────────────────────────────────────────────
  const statusChips = [
    ...(isLoading ? [{ label: "Thinking...", color: "bg-violet-100 text-violet-700" }] : []),
    ...(jobDescription ? [{ label: "JD attached", color: "bg-emerald-100 text-emerald-700" }] : []),
    ...(knowledgeBase ? [{ label: `KB: ${knowledgeBase.skills.length} skills`, color: "bg-sky-100 text-sky-700" }] : []),
  ];

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ── Header ── */}
      <div className="px-5 py-3.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center">
              <LuBot className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">Resume Agent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowSessions(!showSessions)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors">
              <LuMessageSquare className="h-3.5 w-3.5" />
              {sessions.length > 0 ? `${sessions.length} chats` : "Chats"}
            </button>
            <button onClick={handleNewSession}
              className="flex items-center gap-1 px-2 py-1 text-xs text-accent-600 hover:bg-accent-50 rounded-md transition-colors font-medium">
              <LuPlus className="h-3.5 w-3.5" /> New
            </button>
          </div>
        </div>

        {/* Status chips */}
        {statusChips.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {statusChips.map((chip) => (
              <span key={chip.label} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${chip.color}`}>
                {chip.label === "Thinking..." && <LuLoader className="h-2.5 w-2.5 animate-spin" />}
                {chip.label}
              </span>
            ))}
          </div>
        )}

        {/* Session dropdown */}
        {showSessions && sessions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100 max-h-40 overflow-y-auto space-y-0.5">
            {sessions.map((s) => (
              <div key={s._id} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                activeSessionId === s._id ? "bg-accent-50 text-accent-700" : "text-slate-500 hover:bg-slate-50"}`}>
                {renamingSessionId === s._id ? (
                  <input autoFocus value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => renameSession(s._id, renameValue)}
                    onKeyDown={(e) => { if (e.key === "Enter") renameSession(s._id, renameValue); if (e.key === "Escape") setRenamingSessionId(null); }}
                    className="flex-1 text-xs bg-white border border-slate-300 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-accent-500" />
                ) : (
                  <button onClick={() => { loadSession(s._id); setShowSessions(false); }}
                    onDoubleClick={(e) => { e.stopPropagation(); setRenamingSessionId(s._id); setRenameValue(s.title); }}
                    className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{s.title}</div>
                    <div className="text-slate-400">{s.messageCount} msgs · {new Date(s.updatedAt).toLocaleDateString()}</div>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        {loadingSession && (
          <div className="flex items-center justify-center py-12"><LoadingSpinner /></div>
        )}

        {!loadingSession && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <LuBot className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-700">How can I help with your resume?</p>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
              I have access to your knowledge base. Ask me to improve bullets, write a summary, or tailor for a job description.
            </p>
            <p className="text-[11px] text-slate-400 mt-3">
              Type <span className="font-mono bg-slate-100 px-1 rounded">/</span> for quick commands
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant"
              ? <AgentAvatar />
              : <UserAvatar src={session?.user?.image} name={session?.user?.name} />
            }
            <div className={`flex flex-col max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-accent-600 text-white rounded-tr-sm"
                  : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <MessageContent
                    content={msg.content}
                    appliedData={msg.appliedData}
                    appliedKB={msg.appliedKB}
                    onApplyResume={onApplyResumeData}
                    onApplyKB={onApplyKBData}
                  />
                ) : (
                  <span className="whitespace-pre-wrap text-sm">{msg.content}</span>
                )}
              </div>
              {msg.timestamp && (
                <span className="text-[10px] text-slate-400 mt-1 px-1">{formatTime(msg.timestamp)}</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <AgentAvatar />
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
              <LuLoader className="h-3.5 w-3.5 animate-spin text-accent-500" />
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Slash Command Menu ── */}
      {showSlashMenu && (
        <div className="border-t border-slate-100 bg-white px-3 py-2 shrink-0 shadow-inner">
          {slashCommands
            .filter((cmd) => !slashFilter || cmd.command.startsWith(slashFilter))
            .map((cmd) => (
              <button key={cmd.command} onClick={() => handleSlashCommand(cmd.command)}
                className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-3 transition-colors">
                <span className="text-xs font-mono text-accent-600 font-bold w-20">{cmd.command}</span>
                <span className="text-xs text-slate-500">{cmd.description}</span>
              </button>
            ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200 focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-500/20 transition-all">
          <button className="text-slate-400 hover:text-slate-600 transition-colors">
            <LuPaperclip className="h-4 w-4" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (showSlashMenu) {
                  const match = slashCommands.find((cmd) => cmd.command === input.trim());
                  if (match) { handleSlashCommand(match.command); return; }
                }
                sendChatMessage(input);
              }
              if (e.key === "Escape") setShowSlashMenu(false);
            }}
            placeholder="Paste Job Description or ask the agent..."
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
            disabled={isLoading}
          />
          <button
            onClick={() => sendChatMessage(input)}
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 rounded-lg bg-accent-600 text-white flex items-center justify-center hover:bg-accent-700 disabled:opacity-40 disabled:pointer-events-none transition-colors shrink-0">
            <LuSend className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[10px] text-slate-400">Agentic Engine v2.4</span>
          <span className="text-[10px] text-slate-400">Shift + Enter to send</span>
        </div>
      </div>

      {/* ── JD Modal ── */}
      {showJdEditor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowJdEditor(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Job Description</h3>
            <textarea autoFocus value={jdDraft} onChange={(e) => setJdDraft(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[200px] text-slate-700"
              placeholder="Paste the job description here..." />
            <div className="flex justify-end gap-2 mt-3">
              <Button size="sm" variant="ghost" onClick={() => setShowJdEditor(false)}>Cancel</Button>
              <Button size="sm" onClick={() => {
                if (onUpdateJD) onUpdateJD(jdDraft);
                setShowJdEditor(false);
                setMessages((prev) => [...prev, { role: "assistant", content: "Job description saved. Use `/tailor` or `/ats` to analyze against it.", timestamp: new Date().toISOString() }]);
              }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatTailorResult(result: Record<string, unknown>): string {
  if (result.content) return result.content as string;
  let text = `## Resume Tailoring Results\n\n**Match Score:** ${result.matchScore}/100\n\n`;
  if (result.tailoredSummary) text += `### Tailored Summary\n${result.tailoredSummary}\n\n`;
  if (Array.isArray(result.suggestions)) {
    text += `### Suggestions\n`;
    for (const s of result.suggestions as Array<{ section: string; suggested: string; reason: string }>)
      text += `- **${s.section}**: ${s.suggested} _(${s.reason})_\n`;
  }
  if (Array.isArray(result.missingKeywords) && result.missingKeywords.length)
    text += `\n### Missing Keywords\n${(result.missingKeywords as string[]).join(", ")}`;
  return text;
}

function formatAtsResult(result: Record<string, unknown>): string {
  if (result.content) return result.content as string;
  let text = `## ATS Compatibility Score\n\n**Overall: ${result.overall}/100**\n\n`;
  text += `| Category | Score |\n|---|---|\n`;
  text += `| Keyword Match | ${result.keywordMatch}/100 |\n`;
  text += `| Skills Alignment | ${result.skillsAlignment}/100 |\n`;
  text += `| Format | ${result.formatCompatibility}/100 |\n`;
  text += `| Content Relevance | ${result.contentRelevance}/100 |\n\n`;
  if (Array.isArray(result.suggestions)) {
    text += `### Improvements\n`;
    for (const s of result.suggestions as string[]) text += `- ${s}\n`;
  }
  if (Array.isArray(result.missingKeywords) && result.missingKeywords.length)
    text += `\n### Missing Keywords\n${(result.missingKeywords as string[]).join(", ")}`;
  return text;
}
