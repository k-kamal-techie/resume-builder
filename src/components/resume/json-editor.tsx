"use client";

import { useState, useCallback } from "react";
import type { ResumeData } from "@/types/resume";

interface JsonEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export default function JsonEditor({ data, onChange }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [dirtyText, setDirtyText] = useState("");

  // When not dirty, derive display text from props directly
  const jsonText = isDirty ? dirtyText : JSON.stringify(data, null, 2);

  const handleChange = useCallback((value: string) => {
    setDirtyText(value);
    setIsDirty(true);
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && parsed.personalInfo) {
        setError(null);
      } else {
        setError("JSON must contain a personalInfo field");
      }
    } catch {
      setError("Invalid JSON syntax");
    }
  }, []);

  const applyChanges = useCallback(() => {
    try {
      const parsed = JSON.parse(dirtyText);
      if (parsed && parsed.personalInfo) {
        onChange(parsed as ResumeData);
        setIsDirty(false);
        setError(null);
      }
    } catch {
      // error already shown
    }
  }, [dirtyText, onChange]);

  const resetChanges = useCallback(() => {
    setDirtyText("");
    setIsDirty(false);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {isDirty && (
        <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs text-amber-600 dark:text-yellow-400">Unsaved changes</span>
          <div className="flex gap-2">
            <button
              onClick={resetChanges}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Reset
            </button>
            <button
              onClick={applyChanges}
              disabled={!!error}
              className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 disabled:opacity-50 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:hover:bg-transparent"
            >
              Apply
            </button>
          </div>
        </div>
      )}
      {error && (
        <div className="px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs border-b border-red-100 dark:border-transparent">
          {error}
        </div>
      )}
      <textarea
        value={jsonText}
        onChange={(e) => handleChange(e.target.value)}
        className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-green-400 font-mono text-xs p-4 resize-none focus:outline-none leading-relaxed"
        spellCheck={false}
      />
    </div>
  );
}
