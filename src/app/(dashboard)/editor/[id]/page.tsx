"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import ChatPanel from "@/components/ai/chat-panel";
import PreviewPanel from "@/components/resume/preview-panel";
import Button from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { ResumeData, TemplateId } from "@/types/resume";
import { LuSave, LuEye, LuUndo2, LuChevronDown } from "react-icons/lu";

const emptyResumeData: ResumeData = {
  personalInfo: { fullName: "", email: "" },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
};

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData);
  const [undoStack, setUndoStack] = useState<ResumeData[]>([]);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "json-editor">("preview");

  useEffect(() => {
    fetchResume();
  }, [id]);

  async function fetchResume() {
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title);
        setTemplateId(data.templateId);
        setResumeData(data.data || emptyResumeData);
      } else {
        router.push("/dashboard");
      }
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  const saveResume = useCallback(async () => {
    setSaving(true);
    try {
      await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, templateId, data: resumeData }),
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }, [id, title, templateId, resumeData]);

  // Auto-save with debounce
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      saveResume();
    }, 2000);
    return () => clearTimeout(timer);
  }, [resumeData, title, templateId, loading, saveResume]);

  const applyResumeData = useCallback(
    (newData: ResumeData) => {
      setUndoStack((prev) => {
        const stack = prev.length >= 50 ? prev.slice(1) : prev;
        return [...stack, resumeData];
      });
      setResumeData(newData);
    },
    [resumeData]
  );

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const stack = [...prev];
      const previousState = stack.pop()!;
      setResumeData(previousState);
      return stack;
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
            placeholder="Resume Title"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as TemplateId)}
              className="appearance-none rounded-lg border border-gray-300 px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
            </select>
            <LuChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={undoStack.length === 0}
            title={`Undo (${undoStack.length} steps)`}
          >
            <LuUndo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/preview/${id}`)}
          >
            <LuEye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" onClick={saveResume} disabled={saving}>
            <LuSave className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
          {lastSaved && (
            <span className="text-xs text-gray-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Two-panel layout: AI Chat (70%) | Preview/JSON (30%) */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[70%] overflow-hidden">
          <ChatPanel
            resumeId={id}
            resumeData={resumeData}
            onApplyResumeData={applyResumeData}
          />
        </div>
        <div className="w-[30%] overflow-hidden">
          <PreviewPanel
            data={resumeData}
            templateId={templateId}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onDataChange={applyResumeData}
          />
        </div>
      </div>
    </div>
  );
}
