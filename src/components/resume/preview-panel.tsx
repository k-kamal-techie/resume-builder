"use client";

import ResumePreview from "./resume-preview";
import JsonEditor from "./json-editor";
import { useTheme, colorPresets } from "@/components/providers/theme-provider";
import type { ResumeData, TemplateId } from "@/types/resume";
import { LuEye, LuCode, LuDownload, LuPalette } from "react-icons/lu";

type TabMode = "preview" | "json-editor" | "theme";

interface PreviewPanelProps {
  data: ResumeData;
  templateId: TemplateId;
  viewMode: "preview" | "json-editor";
  onViewModeChange: (mode: "preview" | "json-editor") => void;
  onDataChange: (data: ResumeData) => void;
}

const tabs: { id: TabMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "preview",     label: "Preview",    icon: LuEye },
  { id: "json-editor", label: "Edit JSON",  icon: LuCode },
  { id: "theme",       label: "Theme",      icon: LuPalette },
];

function ThemeTab() {
  const { preset, setPreset } = useTheme();
  return (
    <div className="p-5 space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Accent Color</p>
        <div className="grid grid-cols-4 gap-3">
          {colorPresets.map((p) => (
            <button
              key={p.name}
              onClick={() => setPreset(p.name)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                preset === p.name
                  ? "border-slate-800 bg-slate-50"
                  : "border-transparent hover:border-slate-200"
              }`}
            >
              <div className="h-8 w-8 rounded-full" style={{ backgroundColor: p.colors[600] }} />
              <span className="text-[10px] font-medium text-slate-600">{p.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PreviewPanel({
  data,
  templateId,
  viewMode,
  onViewModeChange,
  onDataChange,
}: PreviewPanelProps) {
  const activeTab: TabMode = viewMode === "json-editor" ? "json-editor" : "preview";

  function handleTabClick(id: TabMode) {
    if (id === "theme") {
      // handled internally
      onViewModeChange("preview");
    } else {
      onViewModeChange(id);
    }
  }

  return (
    <div className="flex flex-col h-full border-l border-slate-100 bg-white">
      {/* Tab bar */}
      <div className="flex items-center border-b border-slate-100 px-2 shrink-0 bg-white">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab || (tab.id === "theme" && viewMode === "preview" && activeTab === "preview" && false);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors ${
                (tab.id === activeTab)
                  ? "border-accent-600 text-accent-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1 pr-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
            title="Export PDF"
          >
            <LuDownload className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "json-editor" ? (
          <JsonEditor data={data} onChange={onDataChange} />
        ) : (
          <div className="h-full overflow-auto bg-slate-100">
            <ResumePreview data={data} templateId={templateId} scale={0.6} />
          </div>
        )}
      </div>
    </div>
  );
}
