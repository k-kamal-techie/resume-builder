"use client";

import ResumePreview from "./resume-preview";
import JsonEditor from "./json-editor";
import type { ResumeData, TemplateId } from "@/types/resume";
import { LuEye, LuCode } from "react-icons/lu";

interface PreviewPanelProps {
  data: ResumeData;
  templateId: TemplateId;
  viewMode: "preview" | "json-editor";
  onViewModeChange: (mode: "preview" | "json-editor") => void;
  onDataChange: (data: ResumeData) => void;
}

export default function PreviewPanel({
  data,
  templateId,
  viewMode,
  onViewModeChange,
  onDataChange,
}: PreviewPanelProps) {
  return (
    <div className="flex flex-col h-full border-l border-gray-200">
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={() => onViewModeChange("preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === "preview"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LuEye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          onClick={() => onViewModeChange("json-editor")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === "json-editor"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <LuCode className="h-3.5 w-3.5" />
          JSON
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {viewMode === "preview" ? (
          <div className="h-full overflow-auto">
            <ResumePreview data={data} templateId={templateId} scale={0.45} />
          </div>
        ) : (
          <JsonEditor data={data} onChange={onDataChange} />
        )}
      </div>
    </div>
  );
}
