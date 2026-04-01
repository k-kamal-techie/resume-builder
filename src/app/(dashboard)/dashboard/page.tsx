"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    if (searchParams.get("new") === "true") setShowCreateModal(true);
  }, [searchParams]);

  async function loadResumes() {
    try { setResumes(await fetchResumesAPI()); }
    catch { /* ignore */ }
    finally { setLoading(false); }
  }

  async function handleCreateResume() {
    setCreating(true); setError("");
    try {
      const resume = await createResumeAPI({ title: newTitle, templateId: newTemplate });
      router.push(`/editor/${resume._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Please try again.");
    } finally { setCreating(false); }
  }

  async function handleDeleteResume(id: string) {
    if (!confirm("Delete this resume?")) return;
    try { await deleteResumeAPI(id); setResumes((prev) => prev.filter((r) => r._id !== id)); }
    catch { /* ignore */ }
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
    return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  }

  return (
    <div className="p-7">
      {/* Page header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Workspace</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">My Resumes</h1>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <LuPlus className="h-4 w-4 mr-1.5" />
          New Resume
        </Button>
      </div>

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <LuFileText className="h-7 w-7 text-slate-400" />
          </div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">No resumes yet</h2>
          <p className="text-xs text-slate-400 mb-5 max-w-xs">
            Create your first AI-powered resume and let the agent help you build it.
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            <LuPlus className="h-4 w-4 mr-1.5" />
            Create Resume
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume._id}
              onClick={() => router.push(`/editor/${resume._id}`)}
              className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:border-accent-300 dark:hover:border-accent-500 hover:shadow-md transition-all"
            >
              {/* Resume preview thumbnail area */}
              <div className="h-28 bg-slate-50 dark:bg-slate-700 rounded-xl mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-600">
                <LuFileText className="h-8 w-8 text-slate-300 dark:text-slate-500" />
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {renamingId === resume._id ? (
                    <input
                      autoFocus value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameResume(resume._id, renameValue)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleRenameResume(resume._id, renameValue); if (e.key === "Escape") setRenamingId(null); }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm font-semibold text-slate-900 dark:text-white w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-accent-500"
                    />
                  ) : (
                    <h3
                      className="text-sm font-semibold text-slate-900 dark:text-white truncate"
                      onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(resume._id); setRenameValue(resume.title); }}
                    >
                      {resume.title}
                    </h3>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <LuClock className="h-3 w-3" />
                    {new Date(resume.lastEditedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/editor/${resume._id}`); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  >
                    <LuPencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteResume(resume._id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <LuTrash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Resume">
        <div className="space-y-4">
          <Input
            label="Resume Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g., Software Engineer Resume"
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Template</label>
            <div className="grid grid-cols-3 gap-3">
              {(["classic", "modern", "minimal"] as TemplateId[]).map((t) => (
                <button key={t} onClick={() => setNewTemplate(t)}
                  className={`rounded-xl border-2 p-3 text-xs font-semibold capitalize transition-colors ${
                    newTemplate === t ? "border-accent-600 bg-accent-50 dark:bg-accent-600/20 text-accent-700 dark:text-accent-400" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500"
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <Button onClick={handleCreateResume} disabled={creating} className="flex-1">
              {creating ? "Creating..." : "Create Resume"}
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
