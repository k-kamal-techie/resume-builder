"use client";

import { useState, useEffect, useCallback, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatPanel from "@/components/ai/chat-panel";
import PreviewPanel from "@/components/resume/preview-panel";
import Button from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { ResumeData, TemplateId } from "@/types/resume";
import type { KnowledgeBaseData } from "@/types/knowledge-base";
import { fetchResume as fetchResumeAPI } from "@/lib/services/resume";
import { updateResume } from "@/lib/services/resume";
import { fetchKnowledgeBase, updateKnowledgeBase, extractKBData } from "@/lib/services/knowledge-base";
import { LuSave, LuUndo2, LuArrowLeft } from "react-icons/lu";

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
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
      <EditorContent id={id} />
    </Suspense>
  );
}

function EditorContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumeData, setResumeData] = useState<ResumeData>(emptyResumeData);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseData | null>(null);
  const [undoStack, setUndoStack] = useState<ResumeData[]>([]);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"preview" | "json-editor">("preview");

  const initialJd = searchParams.get("jd") || undefined;

  useEffect(() => {
    Promise.all([loadResume(), loadKB()]).then(() => setLoading(false));
  }, [id]);

  async function loadResume() {
    const data = await fetchResumeAPI(id);
    if (!data) {
      router.push("/dashboard");
      return;
    }
    setTitle(data.title);
    setTemplateId(data.templateId as TemplateId);
    setResumeData(data.data || emptyResumeData);
    setJobDescription(data.jobDescription || "");
  }

  async function loadKB() {
    try {
      const kb = await fetchKnowledgeBase();
      setKnowledgeBase(extractKBData(kb));
    } catch {
      // KB fetch failure is non-fatal
    }
  }

  const saveResume = useCallback(async () => {
    setSaving(true);
    try {
      await updateResume(id, { title, templateId, data: resumeData, jobDescription });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setSaving(false);
    }
  }, [id, title, templateId, resumeData, jobDescription]);

  // No auto-save — user must explicitly click Save or say "save" in chat

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

  const applyKBData = useCallback(async (newKB: KnowledgeBaseData) => {
    setKnowledgeBase(newKB);
    try {
      await updateKnowledgeBase(newKB);
    } catch (error) {
      // Surface as warn so Next.js dev overlay doesn't fire on best-effort saves
      console.warn("Failed to save KB:", error);
    }
  }, []);

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
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            title="Back to dashboard"
          >
            <LuArrowLeft className="h-4 w-4" />
          </button>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-sm font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 min-w-0 truncate"
            placeholder="Resume Title"
          />
          <span className="shrink-0 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full">
            Draft
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={undoStack.length === 0}
            title={`Undo (${undoStack.length} steps)`}
          >
            <LuUndo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button size="sm" onClick={saveResume} disabled={saving}>
            <LuSave className="h-4 w-4 mr-1" />
            {saving ? "Saving..." : "Save"}
          </Button>
          {lastSaved && (
            <span className="text-xs text-slate-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Two-panel layout: AI Chat (55%) | Preview/JSON (45%) */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[55%] overflow-hidden">
          <ChatPanel
            resumeId={id}
            resumeData={resumeData}
            knowledgeBase={knowledgeBase}
            jobDescription={jobDescription}
            onApplyResumeData={applyResumeData}
            onApplyKBData={applyKBData}
            onSave={saveResume}
            onUpdateJD={setJobDescription}
            initialJd={initialJd}
          />
        </div>
        <div className="w-[45%] overflow-hidden">
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
