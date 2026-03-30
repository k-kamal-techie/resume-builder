import type { ResumeData } from "@/types/resume";

interface Props {
  data: ResumeData;
}

export default function ClassicTemplate({ data }: Props) {
  const personalInfo = data.personalInfo || { fullName: "", email: "" };
  const education = data.education || [];
  const experience = data.experience || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return (
    <div className="max-w-[800px] mx-auto bg-white p-8 font-serif text-gray-800 text-sm leading-relaxed">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold uppercase tracking-wide">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
          {personalInfo.github && <span>| {personalInfo.github}</span>}
          {personalInfo.website && <span>| {personalInfo.website}</span>}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-xs">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-xs">{exp.position}</h3>
                <span className="text-xs text-gray-500">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              <p className="text-xs text-gray-600 italic">
                {exp.company}{exp.location ? `, ${exp.location}` : ""}
              </p>
              {(exp.highlights || []).filter(Boolean).length > 0 && (
                <ul className="list-disc ml-4 mt-1 space-y-0.5">
                  {(exp.highlights || []).filter(Boolean).map((hl, j) => (
                    <li key={j} className="text-xs">{hl}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-xs">{edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}</h3>
                <span className="text-xs text-gray-500">
                  {edu.startDate} - {edu.endDate || "Present"}
                </span>
              </div>
              <p className="text-xs text-gray-600">{edu.institution}{edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</p>
              {edu.description && <p className="text-xs mt-1">{edu.description}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            Skills
          </h2>
          <div className="space-y-1">
            {skills.map((skill: { category?: string; items?: string[]; name?: string }, i: number) => {
              const items = Array.isArray(skill.items) && skill.items.length > 0
                ? skill.items
                : skill.name ? [skill.name] : [];
              if (items.length === 0) return null;
              return (
                <div key={i} className="text-xs">
                  <span className="font-semibold">{skill.category || ""}:</span>{" "}
                  {items.join(", ")}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-xs">{proj.name}</h3>
                {proj.url && <span className="text-xs text-blue-600">{proj.url}</span>}
              </div>
              <p className="text-xs text-gray-600">{proj.description}</p>
              {(proj.technologies || []).length > 0 && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Tech: {(proj.technologies || []).join(", ")}
                </p>
              )}
              {(proj.highlights || []).filter(Boolean).length > 0 && (
                <ul className="list-disc ml-4 mt-1 space-y-0.5">
                  {(proj.highlights || []).filter(Boolean).map((hl, j) => (
                    <li key={j} className="text-xs">{hl}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase border-b border-gray-400 pb-1 mb-2">
            Certifications
          </h2>
          {certifications.map((cert, i) => (
            <div key={i} className="text-xs mb-1">
              <span className="font-semibold">{cert.name}</span> - {cert.issuer} ({cert.date})
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
