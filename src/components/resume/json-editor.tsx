"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-json";
import type { ResumeData } from "@/types/resume";

interface JsonEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

function highlightJSON(code: string): string {
  return Prism.highlight(code, Prism.languages.json, "json");
}

export default function JsonEditor({ data, onChange }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [dirtyText, setDirtyText] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const jsonText = isDirty ? dirtyText : JSON.stringify(data, null, 2);

  // Inject Prism theme styles once
  useEffect(() => {
    const id = "prism-json-theme";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      /* Light mode */
      .json-editor .token.property { color: #1e293b; }
      .json-editor .token.string { color: #059669; }
      .json-editor .token.number { color: #2563eb; }
      .json-editor .token.boolean,
      .json-editor .token.null { color: #9333ea; }
      .json-editor .token.punctuation { color: #94a3b8; }
      .json-editor .token.operator { color: #94a3b8; }

      /* Dark mode */
      .dark .json-editor .token.property { color: #e2e8f0; }
      .dark .json-editor .token.string { color: #34d399; }
      .dark .json-editor .token.number { color: #60a5fa; }
      .dark .json-editor .token.boolean,
      .dark .json-editor .token.null { color: #c084fc; }
      .dark .json-editor .token.punctuation { color: #64748b; }
      .dark .json-editor .token.operator { color: #64748b; }

      /* Line numbers */
      .json-editor-lines {
        counter-reset: line;
      }
      .json-editor-lines .editable-line {
        counter-increment: line;
        position: relative;
        padding-left: 3.5rem !important;
      }
      .json-editor-lines .editable-line::before {
        content: counter(line);
        position: absolute;
        left: 0;
        width: 2.5rem;
        text-align: right;
        padding-right: 0.75rem;
        color: #cbd5e1;
        user-select: none;
        pointer-events: none;
      }
      .dark .json-editor-lines .editable-line::before {
        color: #475569;
      }

      /* Editor textarea styling */
      .json-editor textarea {
        outline: none !important;
        caret-color: #475569;
      }
      .dark .json-editor textarea {
        caret-color: #94a3b8;
      }
    `;
    document.head.appendChild(style);
  }, []);

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
      <div ref={editorRef} className="json-editor flex-1 overflow-auto">
        <Editor
          value={jsonText}
          onValueChange={handleChange}
          highlight={highlightJSON}
          padding={16}
          className="json-editor-lines"
          textareaClassName="focus:outline-none"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.75rem",
            lineHeight: "1.625",
            minHeight: "100%",
          }}
        />
      </div>
    </div>
  );
}
