"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import Input from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { LuPlus, LuTrash2, LuPencil, LuClock, LuFileText } from "react-icons/lu";
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

  useEffect(() => {
    fetchResumes();
    if (searchParams.get("new") === "true") {
      setShowCreateModal(true);
    }
  }, [searchParams]);

  async function fetchResumes() {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data);
      }
    } catch (error) {
      console.error("Failed to fetch resumes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createResume() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, templateId: newTemplate }),
      });
      if (res.ok) {
        const resume = await res.json();
        router.push(`/editor/${resume._id}`);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || `Failed to create resume (${res.status})`);
      }
    } catch (err) {
      console.error("Failed to create resume:", err);
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function deleteResume(id: string) {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes(resumes.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete resume:", error);
    }
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
                    <h3 className="font-semibold text-gray-900 truncate">{resume.title}</h3>
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
                        deleteResume(resume._id);
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
                      ? "border-blue-600 bg-blue-50 text-blue-700"
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
            <Button onClick={createResume} disabled={creating} className="flex-1">
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
