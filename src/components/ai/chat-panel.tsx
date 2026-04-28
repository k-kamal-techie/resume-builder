"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import type { ChatMessage, ChatPanelProps } from "./chat-types";
import { extractResumeUpdate, extractKBUpdate, formatTailorResult, formatAtsResult } from "./chat-helpers";
import ChatHeader from "./chat-header";
import ChatMessages from "./chat-messages";
import ChatInput from "./chat-input";
import { sendChatMessage as sendChatAPI, tailorResume, getAtsScore } from "@/lib/services/ai";
import {
  listChatSessions, createChatSession, fetchChatSession, saveChatSession,
  type ChatSessionSummary,
} from "@/lib/services/chat-session";

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
  const [authExpired, setAuthExpired] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function isAuthError(err: unknown): boolean {
    return err instanceof Error && /\(401\)/.test(err.message);
  }

  // Load sessions on mount
  useEffect(() => {
    listChatSessions(resumeId).then((s) => {
      setSessions(s);
      if (s.length > 0 && s[0].messageCount > 0) loadSession(s[0]._id, s[0].title);
    }).catch(() => {});
  }, [resumeId]);

  // Auto-save with 1s debounce
  useEffect(() => {
    if (!activeSessionId || messages.length === 0 || authExpired) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveChatSession(activeSessionId, {
        messages: messages.map((m) => ({ role: m.role, content: m.content, timestamp: m.timestamp || new Date().toISOString() })),
      }).catch((err) => {
        if (isAuthError(err)) {
          setAuthExpired(true);
        } else {
          // Autosave is best-effort — warn instead of error so dev overlay doesn't fire
          console.warn("Autosave failed:", err);
        }
      });
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [messages, activeSessionId, authExpired]);

  // Initial JD auto-send
  useEffect(() => {
    if (initialJd && !jdSent && !isLoading) {
      setJdSent(true);
      handleNewSession().then(() => {
        sendChatMessage(`I have a new job description I want to create a resume for. Please analyze it against my knowledge base, identify relevant experience and skills, ask me any clarifying questions, and then build a tailored resume.\n\nJob Description:\n${initialJd}`);
      });
    }
  }, [initialJd, jdSent]);

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

  async function handleRenameSession(sessionId: string, title: string) {
    try {
      await saveChatSession(sessionId, { title });
      setSessions((prev) => prev.map((s) => s._id === sessionId ? { ...s, title } : s));
      if (sessionId === activeSessionId) setActiveSessionTitle(title);
    } catch { console.error("Failed to rename"); }
  }

  async function handleRenameCurrentSession(title: string) {
    if (!activeSessionId) return;
    await handleRenameSession(activeSessionId, title);
  }

  function buildEnrichedMessage(msg: string): string {
    const parts: string[] = [];
    if (knowledgeBase) {
      parts.push(
        "[Your Knowledge Base — full JSON, this is the EXACT shape any kb-json reply must match]",
        JSON.stringify(
          {
            profile: knowledgeBase.profile,
            timeline: knowledgeBase.timeline,
            skills: knowledgeBase.skills,
            projects: knowledgeBase.projects,
            achievements: knowledgeBase.achievements,
          },
          null,
          2,
        ),
        "",
      );
    }
    parts.push(
      "[Current Resume]",
      JSON.stringify(resumeData, null, 2),
      "",
      "[Instructions]",
      "- When updating the resume, output a ```resume-json code block with the COMPLETE updated resume JSON",
      "- When updating the knowledge base, output a ```kb-json code block with the COMPLETE updated KB JSON in the SAME shape as above (preserve all object structures — do NOT replace objects with summary strings)",
      "- KB shape requirements (Zod-validated server side):",
      "  • profile.fullName, profile.email are required strings; URL fields (website, linkedin, github) must be valid http(s) URLs or empty string",
      "  • timeline[i] requires: type (one of \"role\"|\"education\"|\"certification\"|\"achievement\"|\"volunteer\"), title, organization, startDate; arrays default to []",
      "  • skills[i] requires: name, category; proficiency is a number 0–100",
      "  • projects[i] requires: name, description; technologies/highlights/tags are arrays",
      "  • achievements[i] requires: title",
      "- Always output ALL items (do not abbreviate or summarize) when emitting kb-json",
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
        try {
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
              } catch { /* skip malformed chunk */ }
            }
          }
        } catch (streamErr) {
          if (streamErr instanceof DOMException && streamErr.name === "AbortError") {
            assistantContent += "\n\n_Response was interrupted._";
          } else {
            assistantContent += "\n\n_Connection error. Please try again._";
          }
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantContent };
            return updated;
          });
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
      const isNoToken = errMsg.includes("NO_API_TOKEN_CONFIGURED");
      const displayMsg = isNoToken
        ? "**API key not configured.** You need to add your Anthropic API key before using AI features.\n\n[Go to Settings](/settings) to add your API key."
        : `Error: ${errMsg}`;
      setMessages((prev) => [...prev, { role: "assistant", content: displayMsg, timestamp: new Date().toISOString() }]);
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
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "";
      const isNoToken = errMsg.includes("NO_API_TOKEN_CONFIGURED");
      const displayMsg = isNoToken
        ? "**API key not configured.** [Go to Settings](/settings) to add your API key."
        : "Failed to process. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: displayMsg, timestamp: new Date().toISOString() }]);
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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      <ChatHeader
        activeSessionId={activeSessionId}
        activeSessionTitle={activeSessionTitle}
        sessions={sessions}
        isLoading={isLoading}
        jobDescription={jobDescription}
        knowledgeBase={knowledgeBase}
        showSessions={showSessions}
        onToggleSessions={() => setShowSessions((v) => !v)}
        onCloseSessions={() => setShowSessions(false)}
        onNewSession={handleNewSession}
        onLoadSession={loadSession}
        onRenameSession={handleRenameSession}
        onRenameCurrentSession={handleRenameCurrentSession}
      />

      {authExpired && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
          <span>Your session has expired. Chat won&apos;t auto-save until you sign in again.</span>
          <a
            href="/login"
            className="font-semibold text-amber-900 dark:text-amber-200 hover:text-amber-700 dark:hover:text-amber-100 underline underline-offset-2 shrink-0"
          >
            Sign in
          </a>
        </div>
      )}

      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        loadingSession={loadingSession}
        userImage={session?.user?.image}
        userName={session?.user?.name}
        onApplyResume={onApplyResumeData}
        onApplyKB={onApplyKBData}
        onSlashCommand={handleSlashCommand}
      />

      <ChatInput
        input={input}
        isLoading={isLoading}
        showSlashMenu={showSlashMenu}
        slashFilter={slashFilter}
        onInputChange={handleInputChange}
        onSend={sendChatMessage}
        onSlashCommand={handleSlashCommand}
        onCloseSlashMenu={() => setShowSlashMenu(false)}
      />

      {/* JD Modal */}
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
