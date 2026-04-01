"use client";

import { useRef } from "react";
import { slashCommands } from "./chat-types";
import { LuSend, LuLoader, LuZap } from "react-icons/lu";

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  showSlashMenu: boolean;
  slashFilter: string;
  onInputChange: (value: string) => void;
  onSend: (message: string) => void;
  onSlashCommand: (command: string) => void;
  onCloseSlashMenu: () => void;
}

export default function ChatInput({
  input, isLoading, showSlashMenu, slashFilter,
  onInputChange, onSend, onSlashCommand, onCloseSlashMenu,
}: ChatInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const filtered = slashCommands.filter((cmd) => !slashFilter || cmd.command.startsWith(slashFilter));

  return (
    <div className="px-4 pt-3 pb-4 border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-900 shrink-0 relative">
      {showSlashMenu && filtered.length > 0 && (
        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden z-20">
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-2">
            <LuZap className="h-3 w-3 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Quick Commands</span>
          </div>
          {filtered.map((cmd) => (
            <button key={cmd.command} onClick={() => onSlashCommand(cmd.command)}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-3 transition-colors border-b border-slate-50 dark:border-slate-700/30 last:border-0">
              <span className="text-xs font-mono text-accent-600 dark:text-accent-400 font-bold w-[72px] shrink-0">{cmd.command}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700 focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-500/20 transition-all shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            onInputChange(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (showSlashMenu) {
                const match = slashCommands.find((cmd) => cmd.command === input.trim());
                if (match) { onSlashCommand(match.command); return; }
              }
              onSend(input);
              (e.target as HTMLTextAreaElement).style.height = "auto";
            }
            if (e.key === "Escape") onCloseSlashMenu();
          }}
          placeholder="Ask the agent or paste a job description…"
          rows={1}
          className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none min-w-0 resize-none leading-relaxed"
          disabled={isLoading}
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={() => {
            onSend(input);
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
  );
}
