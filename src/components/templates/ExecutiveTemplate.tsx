import React from 'react';
import { UserProfile } from '../../types';
import { formatDate } from '../../lib/utils';

interface TemplateProps {
  data: UserProfile;
  role?: string;
  type?: 'chronological' | 'functional' | 'combination';
}

export function ExecutiveTemplate({ data, role = '', type = 'chronological' }: TemplateProps) {
  const highlight = (text: string) => {
    if (!role || role === 'custom') return text;
    const keywords = role.toLowerCase().split(' ');
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      keywords.includes(part.toLowerCase()) ? (
        <span key={i} className="font-bold text-slate-900 bg-slate-100 rounded px-1">{part}</span>
      ) : part
    );
  };

  return (
    <div className="flex min-h-[297mm] flex-col bg-white p-12 text-slate-900 font-sans">
      {/* Header */}
      <header className="mb-10 flex items-center justify-between border-b-2 border-slate-900 pb-8">
        <div>
          <h1 className="mb-1 text-4xl font-black uppercase tracking-tight">{data.personalInfo.fullName}</h1>
          <h2 className="text-xl font-bold text-slate-500 uppercase tracking-widest">{role}</h2>
        </div>
        <div className="text-right text-sm font-bold text-slate-600">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.city}, {data.personalInfo.country}</p>
          <div className="flex flex-col items-end gap-1 mt-1">
            {data.personalInfo.linkedin && (
              <a href={data.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {data.personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
            {data.personalInfo.github && (
              <a href={data.personalInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {data.personalInfo.github.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
            {data.personalInfo.portfolio && (
              <a href={data.personalInfo.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
                {data.personalInfo.portfolio.replace(/^https?:\/\/(www\.)?/, '')}
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-10">
        {/* Summary */}
        <section>
          <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-900">Executive Summary</h2>
          <p className="text-sm leading-relaxed text-slate-600 italic">
            {data.summary ? highlight(data.summary) : (
              <>
                Professional {role} with extensive expertise in {data.skills.technical.slice(0, 3).join(', ')}. 
                Proven track record of delivering high-impact projects and driving organizational growth.
              </>
            )}
          </p>
        </section>

        {/* Experience */}
        {type !== 'functional' && (
          <section style={{ breakInside: 'avoid' }}>
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-900">Professional Experience</h2>
            <div className="space-y-8">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-center justify-between font-bold mb-2">
                    <h3 className="text-lg">{highlight(exp.position)}</h3>
                    <span className="text-sm text-slate-500">
                      {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate || '')}
                    </span>
                  </div>
                  <p className="mb-3 text-sm font-black text-slate-900 uppercase tracking-wide">{exp.company}</p>
                  <p className="text-sm leading-relaxed text-slate-600">{highlight(exp.description)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Grid */}
        <section style={{ breakInside: 'avoid' }}>
          <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-900">Core Competencies</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Technical</h3>
              {data.skills.technical.map(skill => (
                <div key={skill} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                  {skill}
                </div>
              ))}
            </div>
            {data.skills.soft && data.skills.soft.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Soft Skills</h3>
                {data.skills.soft.map(skill => (
                  <div key={skill} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {skill}
                  </div>
                ))}
              </div>
            )}
            {data.skills.tools && data.skills.tools.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Tools</h3>
                {data.skills.tools.map(skill => (
                  <div key={skill} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <section style={{ breakInside: 'avoid' }}>
            <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-900">Key Achievements & Participation</h2>
            <div className="grid grid-cols-2 gap-8">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="border-l-2 border-slate-900 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black uppercase tracking-tight">{highlight(ach.title)}</h3>
                    <span className="text-[10px] font-bold text-slate-400">{ach.date}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mb-2">{ach.organization}</p>
                  <p className="text-xs leading-relaxed text-slate-600">{highlight(ach.description)}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        <section style={{ breakInside: 'avoid' }}>
          <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-slate-900">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between text-sm">
                <div>
                  <span className="font-bold">{edu.degree}</span>
                  <span className="text-slate-500 mx-2">|</span>
                  <span className="text-slate-600">{edu.institution}</span>
                </div>
                <span className="font-bold text-slate-500">{edu.startYear} — {edu.endYear}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
