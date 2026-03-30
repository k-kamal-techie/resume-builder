"use client";

import { useState, useEffect } from "react";
import JsonEditor from "@/components/resume/json-editor";
import Button from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { fetchKnowledgeBase, updateKnowledgeBase, extractKBData } from "@/lib/services/knowledge-base";
import { LuSave, LuBrain } from "react-icons/lu";
import type { KnowledgeBaseData } from "@/types/knowledge-base";

export default function KnowledgeBasePage() {
  const [data, setData] = useState<KnowledgeBaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchKnowledgeBase()
      .then((kb) => setData(extractKBData(kb)))
      .catch((err) => console.error("Failed to fetch KB:", err))
      .finally(() => setLoading(false));
  }, []);

  async function saveKB() {
    if (!data) return;
    setSaving(true);
    try {
      await updateKnowledgeBase(data);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save KB:", error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        Failed to load knowledge base.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <LuBrain className="h-5 w-5 text-accent-600" />
            Knowledge Base
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data.skills.length} skills, {data.timeline.length} timeline entries, {data.projects.length} projects
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button size="sm" onClick={saveKB} disabled={saving}>
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

      <div className="flex-1 overflow-hidden">
        <JsonEditor
          data={data as unknown as import("@/types/resume").ResumeData}
          onChange={(newData) => setData(newData as unknown as KnowledgeBaseData)}
        />
      </div>
    </div>
  );
}
