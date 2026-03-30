"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { LuPlus, LuTrash2, LuPencil, LuClock, LuFileText } from "react-icons/lu";
import { fetchResumes as fetchResumesAPI, createResume as createResumeAPI, deleteResume as deleteResumeAPI, updateResume as updateResumeAPI } from "@/lib/services/resume";
import type { IResume, TemplateId } from "@/types/resume";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner /></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resumes, setResumes] = useState<IResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("Untitled Resume");
  const [newTemplate, setNewTemplate] = useState<TemplateId>("classic");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    loadResumes();
    if (searchParams.get("new") === "true") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  async function loadResumes() {
    try {
      const data = await fetchResumesAPI();
      setResumes(data);
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateResume() {
    setCreating(true);
    setError("");
    try {
      const resume = await createResumeAPI({ title: newTitle, templateId: newTemplate });
      router.push(`/editor/${resume._id}`);
    } catch (err) {
      console.error("Failed to create resume:", err);
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteResume(id: string) {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await deleteResumeAPI(id);
      setResumes(resumes.filter((r) => r._id !== id));
    } catch (error) {
      console.error("Failed to delete resume:", error);
    }
  }

  async function handleRenameResume(id: string, title: string) {
    if (!title.trim()) { setRenamingId(null); return; }
    try {
      await updateResumeAPI(id, { title });
      setResumes((prev) => prev.map((r) => r._id === id ? { ...r, title } : r));
    } catch { /* ignore */ }
    setRenamingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <LuPlus className="h-4 w-4 mr-2" />
          New Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-16">
          <LuFileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900">No resumes yet</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Create your first AI-powered resume to get started.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <LuPlus className="h-4 w-4 mr-2" />
            Create Resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <Card key={resume._id} hover>
              <CardContent
                className="cursor-pointer"
                onClick={() => router.push(`/editor/${resume._id}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {renamingId === resume._id ? (
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameResume(resume._id, renameValue)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRenameResume(resume._id, renameValue); if (e.key === "Escape") setRenamingId(null); }}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-gray-900 w-full bg-white border border-gray-300 rounded px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent-500"
                      />
                    ) : (
                      <h3
                        className="font-semibold text-gray-900 truncate cursor-text"
                        onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(resume._id); setRenameValue(resume.title); }}
                      >
                        {resume.title}
                      </h3>
                    )}
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {resume.templateId} template
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <LuClock className="h-3 w-3" />
                      {new Date(resume.lastEditedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/editor/${resume._id}`);
                      }}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                    >
                      <LuPencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(resume._id);
                      }}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"
                    >
                      <LuTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Resume"
      >
        <div className="space-y-4">
          <Input
            label="Resume Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Software Engineer Resume"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
            <div className="grid grid-cols-3 gap-3">
              {(["classic", "modern", "minimal"] as TemplateId[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewTemplate(t)}
                  className={`rounded-lg border-2 p-3 text-center text-sm font-medium capitalize transition-colors ${
                    newTemplate === t
                      ? "border-accent-600 bg-accent-50 text-accent-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreateResume} disabled={creating} className="flex-1">
              {creating ? "Creating..." : "Create Resume"}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
