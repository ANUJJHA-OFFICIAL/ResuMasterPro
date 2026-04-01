import React, { useEffect, useRef, useState } from 'react';
import { Resume } from '../types';
import { ModernTemplate } from './templates/ModernTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';
import { ExecutiveTemplate } from './templates/ExecutiveTemplate';

interface ResumePreviewProps {
  resume: Resume;
  className?: string;
}

export function ResumePreview({ resume, className }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // A4 width is 210mm. We convert mm to pixels roughly (1mm = 3.78px)
        // Or we can just use the fixed width we set for the template.
        const templateWidth = 794; // roughly 210mm in pixels at 96dpi
        setScale(containerWidth / templateWidth);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const renderTemplate = () => {
    const props = {
      data: resume.data,
      role: resume.role,
      type: resume.type
    };

    switch (resume.template) {
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'corporate':
        return <CorporateTemplate {...props} />;
      case 'executive':
        return <ExecutiveTemplate {...props} />;
      default:
        return <ModernTemplate {...props} />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-white ${className}`}
      style={{ aspectRatio: '210/297' }}
    >
      <div 
        className="absolute left-0 top-0 origin-top-left"
        style={{ 
          width: '794px', // 210mm
          transform: `scale(${scale})`,
          height: '1123px' // 297mm
        }}
      >
        {renderTemplate()}
      </div>
    </div>
  );
}
