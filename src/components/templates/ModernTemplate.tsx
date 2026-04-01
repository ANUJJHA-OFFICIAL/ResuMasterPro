import React from 'react';
import { UserProfile } from '../../types';
import { formatDate } from '../../lib/utils';

interface TemplateProps {
  data: UserProfile;
  role?: string;
  type?: 'chronological' | 'functional' | 'combination';
}

export function ModernTemplate({ data, role = '', type = 'chronological' }: TemplateProps) {
  const highlight = (text: string) => {
    if (!role || role === 'custom') return text;
    const keywords = role.toLowerCase().split(' ');
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      keywords.includes(part.toLowerCase()) ? (
        <span key={i} className="font-black text-blue-700 underline decoration-blue-300 decoration-2 underline-offset-2">{part}</span>
      ) : part
    );
  };

  return (
    <div className="flex min-h-[297mm] flex-col bg-white p-12 text-slate-900">
      {/* Header */}
      <header className="mb-10 border-b-4 border-blue-600 pb-8">
        <h1 className="mb-2 text-4xl font-extrabold uppercase tracking-tight">{data.personalInfo.fullName}</h1>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>{data.personalInfo.city}, {data.personalInfo.country}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>•</span>
              <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
          {data.personalInfo.github && (
            <>
              <span>•</span>
              <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                {data.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
          {data.personalInfo.portfolio && (
            <>
              <span>•</span>
              <a href={data.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                {data.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-10" style={{ breakInside: 'avoid' }}>
          <h2 className="mb-3 text-xl font-bold uppercase tracking-widest text-blue-600">Professional Summary</h2>
          <p className="text-sm leading-relaxed text-slate-600">{highlight(data.summary)}</p>
        </section>
      )}

      <div className="grid grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="col-span-2 space-y-10">
          {/* Experience - Only if not purely functional */}
          {type !== 'functional' && (
            <section style={{ breakInside: 'avoid' }}>
              <h2 className="mb-6 text-xl font-bold uppercase tracking-widest text-blue-600">Experience</h2>
              <div className="space-y-8">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-bold">{highlight(exp.position)}</h3>
                      <span className="text-sm font-bold text-slate-400">
                        {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate || '')}
                      </span>
                    </div>
                    <p className="mb-3 font-bold text-slate-600">{exp.company}</p>
                    <p className="text-sm leading-relaxed text-slate-500">{highlight(exp.description)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          <section style={{ breakInside: 'avoid' }}>
            <h2 className="mb-6 text-xl font-bold uppercase tracking-widest text-blue-600">Key Projects</h2>
            <div className="space-y-8">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-bold">{highlight(project.title)}</h3>
                    <div className="flex gap-2">
                      {project.techStack.map(tech => (
                        <span key={tech} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <p className="mb-2 text-sm font-bold text-slate-600">{highlight(project.role)}</p>
                  <p className="text-sm leading-relaxed text-slate-500">{highlight(project.description)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Achievements */}
          {data.achievements && data.achievements.length > 0 && (
            <section style={{ breakInside: 'avoid' }}>
              <h2 className="mb-6 text-xl font-bold uppercase tracking-widest text-blue-600">Achievements & Participation</h2>
              <div className="space-y-6">
                {data.achievements.map((ach) => (
                  <div key={ach.id} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-600">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-lg font-bold">{highlight(ach.title)}</h3>
                      <span className="text-xs font-bold text-slate-400">{formatDate(ach.date)}</span>
                    </div>
                    <p className="mb-2 text-sm font-bold text-slate-600">
                      {ach.organization} <span className="ml-2 rounded bg-blue-50 px-2 py-0.5 text-[10px] uppercase text-blue-600">{ach.type}</span>
                    </p>
                    <p className="text-sm leading-relaxed text-slate-500">{highlight(ach.description)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-10">
          {/* Skills */}
          <section>
            <h2 className="mb-6 text-xl font-bold uppercase tracking-widest text-blue-600">Skills</h2>
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase text-slate-400">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map(skill => (
                    <span 
                      key={skill} 
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold",
                        role && skill.toLowerCase().includes(role.toLowerCase()) 
                          ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                          : "bg-blue-50 text-blue-600"
                      )}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              {data.skills.soft && data.skills.soft.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase text-slate-400">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.soft.map(skill => (
                      <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Education */}
          <section>
            <h2 className="mb-6 text-xl font-bold uppercase tracking-widest text-blue-600">Education</h2>
            <div className="space-y-6">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="text-sm font-bold">{edu.degree}</h3>
                  <p className="text-xs font-bold text-slate-600">{edu.institution}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
