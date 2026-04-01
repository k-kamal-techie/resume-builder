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

  // A4 dimensions in px (at 96dpi): 210mm ≈ 794px, 297mm ≈ 1123px
  const pageWidth = 794;
  const pageHeight = 1123;
  const scaledWidth = pageWidth * scale;
  const scaledHeight = pageHeight * scale;

  return (
    <div className="bg-gray-100 p-4 min-h-full overflow-auto flex justify-center">
      <div
        style={{
          width: scaledWidth,
          minHeight: scaledHeight,
          flexShrink: 0,
        }}
      >
        <div
          id="resume-print-area"
          className="shadow-lg bg-white"
          style={{
            width: pageWidth,
            minHeight: pageHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <Template data={data} />
        </div>
      </div>
    </div>
  );
}
