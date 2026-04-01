"use client";

import { useState } from "react";
import ResumePreview from "./resume-preview";
import JsonEditor from "./json-editor";
import type { ResumeData, TemplateId } from "@/types/resume";
import { LuEye, LuCode, LuDownload, LuLoader } from "react-icons/lu";

type TabMode = "preview" | "json-editor";

interface PreviewPanelProps {
  data: ResumeData;
  templateId: TemplateId;
  viewMode: "preview" | "json-editor";
  onViewModeChange: (mode: "preview" | "json-editor") => void;
  onDataChange: (data: ResumeData) => void;
}

const tabs: { id: TabMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "preview",     label: "Preview",   icon: LuEye },
  { id: "json-editor", label: "Edit JSON", icon: LuCode },
];

export default function PreviewPanel({
  data,
  templateId,
  viewMode,
  onViewModeChange,
  onDataChange,
}: PreviewPanelProps) {
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = () => {
    const el = document.getElementById("resume-print-area");
    if (!el || exporting) return;
    setExporting(true);

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument;
    if (!doc) { setExporting(false); return; }

    const clone = el.cloneNode(true) as HTMLElement;
    clone.style.transform = "none";
    clone.style.width = "794px";
    clone.style.boxShadow = "none";
    clone.style.background = "white";

    // Copy all stylesheets into iframe
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((s) => s.outerHTML).join("\n");

    doc.open();
    doc.write(`<!DOCTYPE html><html><head>${styles}<style>
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; background: white; }
</style></head><body>${clone.outerHTML}</body></html>`);
    doc.close();

    // Wait for stylesheets to load, then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { iframe.remove(); setExporting(false); }, 1000);
      }, 300);
    };
    // Fallback if onload doesn't fire (already loaded)
    setTimeout(() => {
      if (iframe.parentElement) {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { iframe.remove(); setExporting(false); }, 1000);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      {/* Tab bar */}
      <div className="flex items-center border-b border-slate-100 dark:border-slate-800 px-2 shrink-0 bg-white dark:bg-slate-900">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === viewMode;
          return (
            <button
              key={tab.id}
              onClick={() => onViewModeChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-accent-600 text-accent-600"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1 pr-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Export PDF"
          >
            {exporting ? (
              <LuLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LuDownload className="h-3.5 w-3.5" />
            )}
            PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "json-editor" ? (
          <JsonEditor data={data} onChange={onDataChange} />
        ) : (
          <div className="h-full overflow-auto bg-slate-100 dark:bg-slate-800">
            <ResumePreview data={data} templateId={templateId} scale={0.6} />
          </div>
        )}
      </div>
    </div>
  );
}
