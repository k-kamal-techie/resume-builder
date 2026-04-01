"use client";

import { useState, useEffect, useRef } from "react";
import type { KnowledgeBaseData } from "@/types/knowledge-base";
import type { ChatSessionSummary } from "@/lib/services/chat-session";
import { formatDate } from "./chat-helpers";
import {
  LuChevronDown, LuBrain, LuPlus, LuMessageSquare,
  LuLoader, LuBot, LuPencil, LuX, LuBriefcase,
} from "react-icons/lu";

interface ChatHeaderProps {
  activeSessionId: string | null;
  activeSessionTitle: string;
  sessions: ChatSessionSummary[];
  isLoading: boolean;
  jobDescription?: string;
  knowledgeBase?: KnowledgeBaseData | null;
  showSessions: boolean;
  onToggleSessions: () => void;
  onCloseSessions: () => void;
  onNewSession: () => void;
  onLoadSession: (id: string, title?: string) => void;
  onRenameSession: (id: string, title: string) => void;
  onRenameCurrentSession: (title: string) => void;
}

export default function ChatHeader({
  activeSessionId, activeSessionTitle, sessions, isLoading,
  jobDescription, knowledgeBase, showSessions,
  onToggleSessions, onCloseSessions, onNewSession,
  onLoadSession, onRenameSession, onRenameCurrentSession,
}: ChatHeaderProps) {
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renamingHeader, setRenamingHeader] = useState(false);
  const [headerRenameValue, setHeaderRenameValue] = useState("");
  const headerRenameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingHeader && headerRenameRef.current) {
      headerRenameRef.current.focus();
      headerRenameRef.current.select();
    }
  }, [renamingHeader]);

  function handleRenameSession(id: string, title: string) {
    if (!title.trim()) { setRenamingSessionId(null); return; }
    onRenameSession(id, title.trim());
    setRenamingSessionId(null);
  }

  function handleRenameCurrentSession(title: string) {
    if (!title.trim()) { setRenamingHeader(false); return; }
    onRenameCurrentSession(title.trim());
    setRenamingHeader(false);
  }

  return (
    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60 shrink-0 relative bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shrink-0 shadow-sm">
          <LuBot className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {renamingHeader ? (
            <input
              ref={headerRenameRef}
              value={headerRenameValue}
              onChange={(e) => setHeaderRenameValue(e.target.value)}
              onBlur={() => handleRenameCurrentSession(headerRenameValue)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameCurrentSession(headerRenameValue);
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

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleSessions}
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
            onClick={onNewSession}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg font-medium text-white bg-accent-600 hover:bg-accent-700 transition-colors"
          >
            <LuPlus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      {showSessions && (
        <>
          <div className="fixed inset-0 z-10" onClick={onCloseSessions} />
          <div className="absolute top-full right-3 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-20 overflow-hidden" style={{ width: "288px" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chat History</span>
              <button
                onClick={onNewSession}
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
                          onBlur={() => handleRenameSession(s._id, renameValue)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameSession(s._id, renameValue);
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
                          onClick={() => { onLoadSession(s._id, s.title); onCloseSessions(); }}
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
  );
}
