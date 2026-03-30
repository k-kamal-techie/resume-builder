import type { ResumeData } from "@/types/resume";
import { LuMail, LuPhone, LuMapPin, LuGlobe, LuGithub, LuLinkedin } from "react-icons/lu";

interface Props {
  data: ResumeData;
}

export default function ModernTemplate({ data }: Props) {
  const personalInfo = data.personalInfo || { fullName: "", email: "" };
  const education = data.education || [];
  const experience = data.experience || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return (
    <div className="max-w-[800px] mx-auto bg-white font-sans text-gray-700 text-sm">
      {/* Header */}
      <div className="bg-blue-600 text-white px-8 py-6">
        <h1 className="text-3xl font-bold">{personalInfo.fullName || "Your Name"}</h1>
        <div className="flex items-center gap-4 mt-3 text-blue-100 text-xs flex-wrap">
          {personalInfo.email && (
            <span className="flex items-center gap-1"><LuMail className="h-3 w-3" />{personalInfo.email}</span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1"><LuPhone className="h-3 w-3" />{personalInfo.phone}</span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1"><LuMapPin className="h-3 w-3" />{personalInfo.location}</span>
          )}
          {personalInfo.website && (
            <span className="flex items-center gap-1"><LuGlobe className="h-3 w-3" />{personalInfo.website}</span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1"><LuGithub className="h-3 w-3" />{personalInfo.github}</span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1"><LuLinkedin className="h-3 w-3" />{personalInfo.linkedin}</span>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Summary */}
        {personalInfo.summary && (
          <section className="mb-6">
            <p className="text-xs leading-relaxed text-gray-600">{personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              Experience
            </h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-4 pl-4 border-l-2 border-blue-100">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-sm text-gray-800">{exp.position}</h3>
                  <span className="text-xs text-gray-400 font-medium">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-medium">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                </p>
                {(exp.highlights || []).filter(Boolean).length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {(exp.highlights || []).filter(Boolean).map((hl, j) => (
                      <li key={j} className="text-xs text-gray-600 flex gap-2">
                        <span className="text-blue-400 mt-1">▸</span>
                        {hl}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        <div className="grid grid-cols-3 gap-6">
          {/* Education */}
          <div className="col-span-2">
            {education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Education
                </h2>
                {education.map((edu, i) => (
                  <div key={i} className="mb-2">
                    <h3 className="font-bold text-xs">{edu.degree}</h3>
                    <p className="text-xs text-gray-500">
                      {edu.institution} | {edu.startDate} - {edu.endDate || "Present"}
                      {edu.gpa ? ` | GPA: ${edu.gpa}` : ""}
                    </p>
                  </div>
                ))}
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Projects
                </h2>
                {projects.map((proj, i) => (
                  <div key={i} className="mb-3">
                    <h3 className="font-bold text-xs">{proj.name}</h3>
                    <p className="text-xs text-gray-600">{proj.description}</p>
                    {(proj.technologies || []).length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(proj.technologies || []).map((tech, j) => (
                          <span key={j} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}
          </div>

          {/* Skills sidebar */}
          <div>
            {skills.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Skills
                </h2>
                {skills.map((skill: { category?: string; items?: string[]; name?: string }, i: number) => {
                  const items = Array.isArray(skill.items) && skill.items.length > 0
                    ? skill.items
                    : skill.name ? [skill.name] : [];
                  if (items.length === 0) return null;
                  return (
                    <div key={i} className="mb-3">
                      <h3 className="text-xs font-semibold text-gray-700 mb-1">{skill.category || ""}</h3>
                      <div className="flex flex-wrap gap-1">
                        {items.map((item: string, j: number) => (
                          <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {certifications.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-blue-600 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Certs
                </h2>
                {certifications.map((cert, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-xs font-semibold">{cert.name}</p>
                    <p className="text-[10px] text-gray-500">{cert.issuer} · {cert.date}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
