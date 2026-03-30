import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

const templates = [
  {
    id: "classic",
    name: "Classic",
    description:
      "Traditional resume layout with clear sections and serif typography. Perfect for corporate and formal applications.",
    color: "bg-gray-800",
  },
  {
    id: "modern",
    name: "Modern",
    description:
      "Contemporary design with a colored header, sidebar layout, and clean typography. Great for tech and creative roles.",
    color: "bg-accent-600",
  },
  {
    id: "minimal",
    name: "Minimal",
    description:
      "Clean and understated design with plenty of whitespace. Ideal for those who want their content to speak for itself.",
    color: "bg-gray-400",
  },
];

export default function TemplatesPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Resume Templates</h1>
          <p className="text-gray-600 mt-2">
            Choose a template and customize it with AI-powered content generation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Template preview placeholder */}
              <div className={`${template.color} h-48 flex items-center justify-center`}>
                <div className="bg-white rounded-lg w-24 h-32 shadow-lg p-2">
                  <div className="h-2 bg-gray-200 rounded mb-1" />
                  <div className="h-1 bg-gray-100 rounded mb-1 w-3/4" />
                  <div className="h-1 bg-gray-100 rounded mb-2 w-1/2" />
                  <div className="space-y-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-0.5 bg-gray-100 rounded" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-accent-600 hover:text-blue-800"
                >
                  Use this template
                  <LuArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
