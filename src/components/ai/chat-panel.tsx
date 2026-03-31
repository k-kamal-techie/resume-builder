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
  LuPlus, LuMessageSquare, LuLoader, LuUser, LuBot,
  LuPencil, LuX, LuZap, LuBriefcase, LuStar,
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
  { command: "/tailor",  description: "Tailor resume to saved job description", icon: LuBriefcase },
  { command: "/ats",     description: "Get ATS compatibility score against JD",  icon: LuStar },
  { command: "/improve", description: "Improve bullets with action verbs",        icon: LuZap },
  { command: "/summary", description: "Generate a professional summary",          icon: LuUser },
  { command: "/save",    description: "Save the current resume",                  icon: LuCheck },
  { command: "/jd",      description: "Set or update the job description",        icon: LuBriefcase },
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

function formatDate(ts: string) {
  try {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  } catch { return ""; }
}

// ─── Avatars ──────────────────────────────────────────────────────────────────

function AgentAvatar() {
  return (
    <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shrink-0 shadow-sm">
      <LuBot className="h-3.5 w-3.5 text-white" />
    </div>
  );
}

function UserAvatar({ src, name }: { src?: string | null; name?: string | null }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={name || ""} referrerPolicy="no-referrer" onError={() => setErr(true)}
      className="h-7 w-7 rounded-xl object-cover shrink-0 shadow-sm" />;
  }
  return (
    <div className="h-7 w-7 rounded-xl bg-accent-600 flex items-center justify-center shrink-0 shadow-sm">
      <LuUser className="h-3.5 w-3.5 text-white" />
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
      <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300
        [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
        [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_p]:my-1.5
        [&_h2]:text-sm [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-semibold [&_h2]:mt-3 [&_h3]:mt-2
        [&_code]:text-xs [&_code]:bg-slate-100 dark:[&_code]:bg-slate-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-slate-700 dark:[&_code]:text-slate-300 [&_code]:font-mono
        [&_pre]:bg-slate-50 dark:[&_pre]:bg-slate-900 [&_pre]:text-xs [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-slate-200 dark:[&_pre]:border-slate-700
        [&_table]:text-xs [&_table]:w-full [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_td]:px-2 [&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-slate-100 dark:[&_tr]:border-slate-700
        [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100 [&_strong]:font-semibold
        [&_a]:text-accent-600 [&_a]:underline-offset-2">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
      </div>

      {/* Data change controls */}
      {jsonMatch && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50">
          <button onClick={() => setShowJson(!showJson)}
            className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors">
            {showJson ? <LuChevronDown className="h-3 w-3" /> : <LuChevronRight className="h-3 w-3" />}
            {showJson ? "Hide" : "View"} JSON
          </button>
          {!appliedData && !appliedKB && (
            <button onClick={handleApply}
              className="flex items-center gap-1.5 text-xs text-white font-medium px-3 py-1 rounded-full bg-accent-600 hover:bg-accent-700 transition-colors shadow-sm">
              <LuCheck className="h-3 w-3" />
              Apply changes
            </button>
          )}
        </div>
      )}
      {showJson && jsonMatch && (
        <pre className="mt-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 overflow-x-auto max-h-48 overflow-y-auto text-slate-600 dark:text-slate-400 font-mono">
          {jsonMatch[1].trim()}
        </pre>
      )}

      {/* Applied badges */}
      {(appliedData || appliedKB) && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {appliedData && (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full font-medium border border-emerald-100 dark:border-emerald-800/30">
              <LuCheck className="h-3 w-3" /> Resume applied
            </span>
          )}
          {appliedKB && (
            <span className="flex items-center gap-1.5 text-[11px] text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-2.5 py-1 rounded-full font-medium border border-violet-100 dark:border-violet-800/30">
              <LuBrain className="h-3 w-3" /> KB updated
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "0.9s" }} />
      ))}
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
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>("");
  const [showSessions, setShowSessions] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  // rename state
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renamingHeader, setRenamingHeader] = useState(false);
  const [headerRenameValue, setHeaderRenameValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const headerRenameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    listChatSessions(resumeId).then((s) => {
      setSessions(s);
      if (s.length > 0 && s[0].messageCount > 0) loadSession(s[0]._id, s[0].title);
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

  useEffect(() => {
    if (renamingHeader && headerRenameRef.current) {
      headerRenameRef.current.focus();
      headerRenameRef.current.select();
    }
  }, [renamingHeader]);

  async function loadSession(sessionId: string, title?: string) {
    setLoadingSession(true);
    try {
      const s = await fetchChatSession(sessionId);
      setActiveSessionId(s._id);
      setActiveSessionTitle(title || s.title || "New Chat");
      setMessages(s.messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp })));
    } catch { console.error("Failed to load session"); }
    finally { setLoadingSession(false); }
  }

  async function renameSession(sessionId: string, title: string) {
    if (!title.trim()) return;
    try {
      await saveChatSession(sessionId, { title: title.trim() });
      setSessions((prev) => prev.map((s) => s._id === sessionId ? { ...s, title: title.trim() } : s));
      if (sessionId === activeSessionId) setActiveSessionTitle(title.trim());
    } catch { console.error("Failed to rename"); }
    setRenamingSessionId(null);
  }

  async function renameCurrentSession(title: string) {
    if (!title.trim() || !activeSessionId) { setRenamingHeader(false); return; }
    try {
      await saveChatSession(activeSessionId, { title: title.trim() });
      setSessions((prev) => prev.map((s) => s._id === activeSessionId ? { ...s, title: title.trim() } : s));
      setActiveSessionTitle(title.trim());
    } catch { console.error("Failed to rename"); }
    setRenamingHeader(false);
  }

  async function handleNewSession() {
    try {
      const s = await createChatSession(resumeId);
      setActiveSessionId(s._id);
      setActiveSessionTitle("New Chat");
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

    let sessionId = activeSessionId;
    if (!sessionId) {
      try {
        const s = await createChatSession(resumeId, messageContent.substring(0, 50));
        sessionId = s._id;
        setActiveSessionId(s._id);
        setActiveSessionTitle(messageContent.substring(0, 40) + (messageContent.length > 40 ? "…" : ""));
        setSessions((prev) => [{ _id: s._id, title: s.title, messageCount: 0, createdAt: s.createdAt, updatedAt: s.updatedAt }, ...prev]);
      } catch { console.error("Failed to create session"); }
    }

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
          const u = [...prev]; u[u.length - 1] = { ...u[u.length - 1], appliedData, appliedKB }; return u;
        });
      }

      if (sessionId && messages.length <= 2) {
        const title = messageContent.substring(0, 50);
        saveChatSession(sessionId, { title }).catch(() => {});
        setSessions((prev) => prev.map((s) => s._id === sessionId ? { ...s, title } : s));
        setActiveSessionTitle(title);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${errMsg}`, timestamp: new Date().toISOString() }]);
    } finally { setIsLoading(false); }
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

  const activeSession = sessions.find((s) => s._id === activeSessionId);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">

      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 shrink-0 relative bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          {/* Agent icon */}
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shrink-0 shadow-sm">
            <LuBot className="h-4 w-4 text-white" />
          </div>

          {/* Session title — clickable to rename */}
          <div className="flex-1 min-w-0">
            {renamingHeader ? (
              <input
                ref={headerRenameRef}
                value={headerRenameValue}
                onChange={(e) => setHeaderRenameValue(e.target.value)}
                onBlur={() => renameCurrentSession(headerRenameValue)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") renameCurrentSession(headerRenameValue);
                  if (e.key === "Escape") setRenamingHeader(false);
                }}
                className="w-full text-sm font-semibold bg-transparent border-b-2 border-accent-500 text-slate-900 dark:text-slate-100 focus:outline-none pb-0.5"
              />
            ) : (
              <button
                onClick={() => {
                  if (!activeSessionId) return;
                  setHeaderRenameValue(activeSessionTitle);
                  setRenamingHeader(true);
                }}
                className="group flex items-center gap-1.5 max-w-full"
                title={activeSessionId ? "Click to rename" : ""}
              >
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {activeSessionTitle || "Resume Agent"}
                </span>
                {activeSessionId && (
                  <LuPencil className="h-3 w-3 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                )}
              </button>
            )}
            {/* Status row */}
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {isLoading && (
                <span className="inline-flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                  <LuLoader className="h-2.5 w-2.5 animate-spin" /> Thinking…
                </span>
              )}
              {jobDescription && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <LuBriefcase className="h-2.5 w-2.5" /> JD attached
                </span>
              )}
              {knowledgeBase && (
                <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 font-medium">
                  <LuBrain className="h-2.5 w-2.5" /> {knowledgeBase.skills.length} skills
                </span>
              )}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setShowSessions((v) => !v)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                showSessions
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <LuMessageSquare className="h-3.5 w-3.5" />
              <span>{sessions.length}</span>
              <LuChevronDown className={`h-3 w-3 transition-transform ${showSessions ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={handleNewSession}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-medium text-white bg-accent-600 hover:bg-accent-700 transition-colors"
            >
              <LuPlus className="h-3.5 w-3.5" />
              New
            </button>
          </div>
        </div>

        {/* ── Session dropdown ── */}
        {showSessions && (
          <>
            {/* Transparent backdrop to close on outside click */}
            <div className="fixed inset-0 z-10" onClick={() => setShowSessions(false)} />
            <div className="absolute top-full right-3 mt-2 w-76 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-20 overflow-hidden" style={{ width: "288px" }}>
              {/* Dropdown header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chat History</span>
                <button
                  onClick={() => { handleNewSession(); }}
                  className="flex items-center gap-1 text-xs font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
                >
                  <LuPlus className="h-3.5 w-3.5" /> New chat
                </button>
              </div>

              {sessions.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <LuMessageSquare className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 dark:text-slate-500">No chats yet</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto py-1">
                  {sessions.map((s) => (
                    <div key={s._id}
                      className={`group mx-1 my-0.5 rounded-xl transition-colors ${
                        activeSessionId === s._id
                          ? "bg-accent-50 dark:bg-accent-600/15"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}>
                      {renamingSessionId === s._id ? (
                        <div className="flex items-center gap-2 px-3 py-2">
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => renameSession(s._id, renameValue)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") renameSession(s._id, renameValue);
                              if (e.key === "Escape") setRenamingSessionId(null);
                            }}
                            className="flex-1 text-xs bg-white dark:bg-slate-700 border border-accent-400 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                          />
                          <button onClick={() => setRenamingSessionId(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <LuX className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-2.5">
                          <button
                            onClick={() => { loadSession(s._id, s.title); setShowSessions(false); }}
                            className="flex-1 text-left min-w-0"
                          >
                            <div className={`text-xs font-medium truncate ${
                              activeSessionId === s._id
                                ? "text-accent-700 dark:text-accent-300"
                                : "text-slate-700 dark:text-slate-200"
                            }`}>
                              {s.title || "New Chat"}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {s.messageCount > 0 ? `${s.messageCount} messages` : "Empty"}
                              </span>
                              <span className="text-[10px] text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {formatDate(s.updatedAt)}
                              </span>
                            </div>
                          </button>
                          {/* Rename button — visible on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenamingSessionId(s._id);
                              setRenameValue(s.title || "");
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all shrink-0"
                            title="Rename"
                          >
                            <LuPencil className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 bg-white dark:bg-slate-900">
        {loadingSession && (
          <div className="flex items-center justify-center py-16"><LoadingSpinner /></div>
        )}

        {!loadingSession && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mb-4 shadow-sm">
              <LuBot className="h-7 w-7 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              How can I help with your resume?
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs leading-relaxed">
              I have access to your knowledge base. Ask me to improve bullets, write a summary, or tailor for a job.
            </p>
            {/* Quick action pills */}
            <div className="flex flex-wrap gap-2 mt-5 justify-center">
              {[
                { label: "Improve bullets", cmd: "/improve" },
                { label: "Write summary", cmd: "/summary" },
                { label: "Tailor to JD", cmd: "/tailor" },
              ].map(({ label, cmd }) => (
                <button key={cmd} onClick={() => handleSlashCommand(cmd)}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-accent-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-600/10 transition-all">
                  {label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-5">
              Type <kbd className="font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md text-[10px]">/</kbd> for all commands
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            {msg.role === "assistant"
              ? <AgentAvatar />
              : <UserAvatar src={session?.user?.image} name={session?.user?.name} />
            }
            <div className={`flex flex-col ${msg.role === "user" ? "items-end max-w-[80%]" : "items-start max-w-[90%]"}`}>
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent-600 text-white rounded-tr-md shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-md shadow-sm"
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
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              {msg.timestamp && (
                <span className="text-[10px] text-slate-300 dark:text-slate-600 mt-1.5 px-1">
                  {formatTime(msg.timestamp)}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <AgentAvatar />
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-4 pt-3 pb-4 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 shrink-0 relative">

        {/* Slash Command Popup — floats above input */}
        {showSlashMenu && (() => {
          const filtered = slashCommands.filter((cmd) => !slashFilter || cmd.command.startsWith(slashFilter));
          return filtered.length > 0 ? (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-20">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
                <LuZap className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Quick Commands</span>
              </div>
              {filtered.map((cmd) => (
                <button key={cmd.command} onClick={() => handleSlashCommand(cmd.command)}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-700/30 last:border-0">
                  <span className="text-xs font-mono text-accent-600 dark:text-accent-400 font-bold w-[72px] shrink-0">{cmd.command}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{cmd.description}</span>
                </button>
              ))}
            </div>
          ) : null;
        })()}

        {/* Input box */}
        <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-500/20 transition-all shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              handleInputChange(e.target.value);
              // auto-resize
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (showSlashMenu) {
                  const match = slashCommands.find((cmd) => cmd.command === input.trim());
                  if (match) { handleSlashCommand(match.command); return; }
                }
                sendChatMessage(input);
                (e.target as HTMLTextAreaElement).style.height = "auto";
              }
              if (e.key === "Escape") setShowSlashMenu(false);
            }}
            placeholder="Ask the agent or paste a job description…"
            rows={1}
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0 resize-none leading-relaxed"
            disabled={isLoading}
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={() => {
              sendChatMessage(input);
              if (inputRef.current) inputRef.current.style.height = "auto";
            }}
            disabled={!input.trim() || isLoading}
            className="h-8 w-8 rounded-xl bg-accent-600 text-white flex items-center justify-center hover:bg-accent-700 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0 shadow-sm">
            {isLoading ? <LuLoader className="h-3.5 w-3.5 animate-spin" /> : <LuSend className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[10px] text-slate-300 dark:text-slate-600">Agentic Engine</span>
          <span className="text-[10px] text-slate-300 dark:text-slate-600">Enter to send · Shift+Enter for new line</span>
        </div>
      </div>

      {/* ── JD Modal ── */}
      {showJdEditor && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowJdEditor(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Job Description</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Paste the JD to tailor your resume or get an ATS score</p>
            </div>
            <div className="p-5">
              <textarea autoFocus value={jdDraft} onChange={(e) => setJdDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[180px] text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 leading-relaxed"
                placeholder="Paste the job description here…" />
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5">
              <Button size="sm" variant="ghost" onClick={() => setShowJdEditor(false)}>Cancel</Button>
              <Button size="sm" onClick={() => {
                if (onUpdateJD) onUpdateJD(jdDraft);
                setShowJdEditor(false);
                setMessages((prev) => [...prev, { role: "assistant", content: "Job description saved. Use `/tailor` or `/ats` to analyze it.", timestamp: new Date().toISOString() }]);
              }}>Save JD</Button>
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
