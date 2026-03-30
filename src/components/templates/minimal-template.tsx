import type { ResumeData } from "@/types/resume";

interface Props {
  data: ResumeData;
}

export default function MinimalTemplate({ data }: Props) {
  const personalInfo = data.personalInfo || { fullName: "", email: "" };
  const education = data.education || [];
  const experience = data.experience || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return (
    <div className="max-w-[800px] mx-auto bg-white p-8 font-sans text-gray-800 text-sm">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-light text-gray-900">
          {personalInfo.fullName || "Your Name"}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
          {[personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin, personalInfo.github]
            .filter(Boolean)
            .map((item, i, arr) => (
              <span key={i}>
                {item}
                {i < arr.length - 1 && <span className="ml-2 text-gray-300">·</span>}
              </span>
            ))}
        </div>
        {personalInfo.summary && (
          <p className="mt-4 text-xs text-gray-600 leading-relaxed max-w-2xl">
            {personalInfo.summary}
          </p>
        )}
      </div>

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between">
                <div>
                  <span className="font-medium text-sm">{exp.position}</span>
                  <span className="text-gray-400 mx-2">at</span>
                  <span className="text-gray-600">{exp.company}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              {(exp.highlights || []).filter(Boolean).length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {(exp.highlights || []).filter(Boolean).map((hl, j) => (
                    <li key={j} className="text-xs text-gray-600 pl-3 relative before:content-['–'] before:absolute before:left-0 before:text-gray-300">
                      {hl}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-2 flex justify-between">
              <div>
                <span className="font-medium text-sm">{edu.degree}</span>
                <span className="text-gray-400 mx-2">·</span>
                <span className="text-gray-600 text-xs">{edu.institution}</span>
                {edu.gpa && <span className="text-xs text-gray-400 ml-2">GPA: {edu.gpa}</span>}
              </div>
              <span className="text-xs text-gray-400">
                {edu.startDate} — {edu.endDate || "Present"}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
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
                  <span className="text-gray-500 font-medium">{skill.category || ""}</span>
                  <span className="text-gray-300 mx-2">·</span>
                  <span className="text-gray-600">{items.join(" · ")}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Projects
          </h2>
          {projects.map((proj, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm">{proj.name}</span>
                {(proj.technologies || []).length > 0 && (
                  <span className="text-[10px] text-gray-400">{(proj.technologies || []).join(", ")}</span>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Certifications
          </h2>
          {certifications.map((cert, i) => (
            <div key={i} className="text-xs mb-1">
              <span className="font-medium">{cert.name}</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-gray-500">{cert.issuer}</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-gray-400">{cert.date}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
