import React from 'react';
import { UserProfile } from '../../types';
import { formatDate } from '../../lib/utils';

interface TemplateProps {
  data: UserProfile;
  role?: string;
  type?: 'chronological' | 'functional' | 'combination';
}

export function CorporateTemplate({ data, role = '', type = 'chronological' }: TemplateProps) {
  const highlight = (text: string) => {
    if (!role || role === 'custom') return text;
    const keywords = role.toLowerCase().split(' ');
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      keywords.includes(part.toLowerCase()) ? (
        <span key={i} className="font-bold text-slate-900 underline decoration-slate-400">{part}</span>
      ) : part
    );
  };

  return (
    <div className="flex min-h-[297mm] flex-col bg-white p-12 text-slate-900 font-serif">
      {/* Header */}
      <header className="mb-8 border-b border-slate-300 pb-6 text-center">
        <h1 className="mb-1 text-3xl font-bold uppercase tracking-widest">{data.personalInfo.fullName}</h1>
        <div className="flex flex-wrap justify-center gap-3 text-xs font-medium text-slate-600">
          <span>{data.personalInfo.email}</span>
          <span>|</span>
          <span>{data.personalInfo.phone}</span>
          <span>|</span>
          <span>{data.personalInfo.city}, {data.personalInfo.country}</span>
          {data.personalInfo.linkedin && (
            <>
              <span>|</span>
              <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
          {data.personalInfo.github && (
            <>
              <span>|</span>
              <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {data.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
          {data.personalInfo.portfolio && (
            <>
              <span>|</span>
              <a href={data.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {data.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            </>
          )}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mb-6" style={{ breakInside: 'avoid' }}>
          <h2 className="mb-2 border-b border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-800">Professional Summary</h2>
          <p className="text-xs leading-relaxed text-slate-600 italic">{highlight(data.summary)}</p>
        </section>
      )}

      <div className="space-y-6">
        {/* Experience */}
        {type !== 'functional' && (
          <section style={{ breakInside: 'avoid' }}>
            <h2 className="mb-3 border-b border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-800">Professional Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-center justify-between font-bold">
                    <h3 className="text-sm">{highlight(exp.position)}</h3>
                    <span className="text-xs text-slate-500">
                      {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate || '')}
                    </span>
                  </div>
                  <p className="mb-1 text-xs font-bold italic text-slate-700">{exp.company}</p>
                  <p className="text-xs leading-relaxed text-slate-600">{highlight(exp.description)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        <section style={{ breakInside: 'avoid' }}>
          <h2 className="mb-3 border-b border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-800">Key Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <div className="flex items-center justify-between font-bold">
                  <h3 className="text-sm">{highlight(project.title)}</h3>
                  <div className="flex gap-1">
                    {project.techStack.map(tech => (
                      <span key={tech} className="text-[9px] text-slate-500">[{tech}]</span>
                    ))}
                  </div>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">{highlight(project.description)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <section style={{ breakInside: 'avoid' }}>
            <h2 className="mb-3 border-b border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-800">Achievements & Honors</h2>
            <div className="space-y-3">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="text-xs">
                  <div className="flex items-center justify-between font-bold">
                    <h3 className="text-sm">{highlight(ach.title)}</h3>
                    <span className="text-slate-500 font-normal">{formatDate(ach.date)}</span>
                  </div>
                  <p className="italic text-slate-700">{ach.organization} • {ach.type}</p>
                  <p className="text-slate-600 leading-relaxed">{highlight(ach.description)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        <section style={{ breakInside: 'avoid' }}>
          <h2 className="mb-3 border-b border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-800">Expertise & Skills</h2>
          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <p className="mb-1 font-bold underline">Technical Skills:</p>
              <p className="text-slate-600">{data.skills.technical.join(', ')}</p>
            </div>
            {data.skills.soft && data.skills.soft.length > 0 && (
              <div>
                <p className="mb-1 font-bold underline">Soft Skills:</p>
                <p className="text-slate-600">{data.skills.soft.join(', ')}</p>
              </div>
            )}
            {data.skills.tools && data.skills.tools.length > 0 && (
              <div>
                <p className="mb-1 font-bold underline">Tools & Technologies:</p>
                <p className="text-slate-600">{data.skills.tools.join(', ')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Education */}
        <section style={{ breakInside: 'avoid' }}>
          <h2 className="mb-3 border-b border-slate-200 text-sm font-bold uppercase tracking-widest text-slate-800">Education</h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between text-xs">
                <div>
                  <span className="font-bold">{edu.degree}</span>, {edu.institution}
                </div>
                <span className="text-slate-500">{edu.startYear} — {edu.endYear}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
