"use client";

import type { ResumeData, TemplateId } from "@/types/resume";
import ClassicTemplate from "@/components/templates/classic-template";
import ModernTemplate from "@/components/templates/modern-template";
import MinimalTemplate from "@/components/templates/minimal-template";

interface Props {
  data: ResumeData;
  templateId: TemplateId;
  scale?: number;
}

const templates = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export default function ResumePreview({ data, templateId, scale = 0.7 }: Props) {
  const Template = templates[templateId] || ClassicTemplate;

  return (
    <div className="bg-gray-100 p-4 min-h-full overflow-auto">
      <div className="shadow-lg mx-auto" style={{ width: "210mm", minHeight: "297mm", transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <Template data={data} />
      </div>
    </div>
  );
}
