"use client";

import { useRef, useEffect } from "react";
import type { ResumeData } from "@/types/resume";
import type { KnowledgeBaseData } from "@/types/knowledge-base";
import type { ChatMessage } from "./chat-types";
import ChatMessageItem from "./chat-message-item";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { LuBot } from "react-icons/lu";

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

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingSession: boolean;
  userImage?: string | null;
  userName?: string | null;
  onApplyResume: (d: ResumeData) => void;
  onApplyKB?: (d: KnowledgeBaseData) => void;
  onSlashCommand: (command: string) => void;
}

export default function ChatMessages({
  messages, isLoading, loadingSession, userImage, userName,
  onApplyResume, onApplyKB, onSlashCommand,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
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
          <div className="flex flex-wrap gap-2 mt-5 justify-center">
            {[
              { label: "Improve bullets", cmd: "/improve" },
              { label: "Write summary", cmd: "/summary" },
              { label: "Tailor to JD", cmd: "/tailor" },
            ].map(({ label, cmd }) => (
              <button key={cmd} onClick={() => onSlashCommand(cmd)}
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
        <ChatMessageItem
          key={i}
          message={msg}
          userImage={userImage}
          userName={userName}
          onApplyResume={onApplyResume}
          onApplyKB={onApplyKB}
        />
      ))}

      {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
        <div className="flex gap-3">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center shrink-0 shadow-sm">
            <LuBot className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
            <TypingDots />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
