"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import ResumePreview from "@/components/resume/resume-preview";
import Button from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import type { ResumeData, TemplateId } from "@/types/resume";
import { LuArrowLeft, LuPrinter, LuPencil } from "react-icons/lu";

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState<TemplateId>("classic");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResume() {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        if (res.ok) {
          const data = await res.json();
          setResumeData(data.data);
          setTemplateId(data.templateId);
          setTitle(data.title);
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchResume();
  }, [id, router]);

  if (loading || !resumeData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <LuArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push(`/editor/${id}`)}>
            <LuPencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <LuPrinter className="h-4 w-4 mr-1" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Resume */}
      <div className="py-8">
        <ResumePreview data={resumeData} templateId={templateId} />
      </div>
    </div>
  );
}
