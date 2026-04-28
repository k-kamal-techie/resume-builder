"use client";

import { useState } from "react";
import type { ResumeData } from "@/types/resume";
import type { KnowledgeBaseData } from "@/types/knowledge-base";
import type { ChatMessage } from "./chat-types";
import { formatTime } from "./chat-helpers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  LuCheck, LuChevronDown, LuChevronRight, LuBrain, LuBot, LuUser,
} from "react-icons/lu";

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
      <div className="prose prose-sm max-w-none min-w-0 text-slate-700 dark:text-slate-300 break-words
        [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
        [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_p]:my-1.5
        [&_h2]:text-sm [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-semibold [&_h2]:mt-3 [&_h3]:mt-2
        [&_code]:text-xs [&_code]:bg-slate-100 dark:[&_code]:bg-slate-700 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-slate-700 dark:[&_code]:text-slate-300 [&_code]:font-mono [&_code]:break-all
        [&_pre]:bg-slate-50 dark:[&_pre]:bg-slate-900 [&_pre]:text-xs [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_pre]:border [&_pre]:border-slate-200 dark:[&_pre]:border-slate-700
        [&_pre_code]:break-normal [&_pre_code]:whitespace-pre
        [&_table]:text-xs [&_table]:w-full [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_td]:px-2 [&_td]:py-1.5 [&_tr]:border-b [&_tr]:border-slate-100 dark:[&_tr]:border-slate-700
        [&_strong]:text-slate-900 dark:[&_strong]:text-slate-100 [&_strong]:font-semibold
        [&_a]:text-accent-600 [&_a]:underline-offset-2 [&_a]:break-all">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
      </div>

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
        <pre className="mt-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 overflow-x-auto max-h-48 overflow-y-auto max-w-full text-slate-600 dark:text-slate-400 font-mono">
          {jsonMatch[1].trim()}
        </pre>
      )}

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

interface ChatMessageItemProps {
  message: ChatMessage;
  userImage?: string | null;
  userName?: string | null;
  onApplyResume: (d: ResumeData) => void;
  onApplyKB?: (d: KnowledgeBaseData) => void;
}

export default function ChatMessageItem({ message, userImage, userName, onApplyResume, onApplyKB }: ChatMessageItemProps) {
  return (
    <div className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
      {message.role === "assistant"
        ? <AgentAvatar />
        : <UserAvatar src={userImage} name={userName} />
      }
      <div className={`flex flex-col min-w-0 ${message.role === "user" ? "items-end max-w-[80%]" : "items-start max-w-[90%]"}`}>
        <div className={`min-w-0 max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden ${
          message.role === "user"
            ? "bg-accent-600 text-white rounded-tr-md shadow-sm"
            : "bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-tl-md shadow-sm"
        }`}>
          {message.role === "assistant" ? (
            <MessageContent
              content={message.content}
              appliedData={message.appliedData}
              appliedKB={message.appliedKB}
              onApplyResume={onApplyResume}
              onApplyKB={onApplyKB}
            />
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>
        {message.timestamp && (
          <span className="text-[10px] text-slate-300 dark:text-slate-600 mt-1.5 px-1">
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
