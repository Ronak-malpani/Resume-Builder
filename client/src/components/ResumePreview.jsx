import React, { useMemo } from 'react';
import ClassicTemplate from '../assets/templates/ClassicTemplate';
import ModernTemplate from '../assets/templates/ModernTemplate';
import MinimalTemplate from '../assets/templates/MinimalTemplate';
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate';
import ProfessionalTemplate from '../assets/templates/ProfessionalTemplate';

const ResumePreview = ({ data, template, accentColor, fontScale = 'auto' }) => {
  
  // Data Sanitization
  const sanitizedData = useMemo(() => ({
    ...data,
    personal_info: {
      ...data.personal_info,
      linkedin: data.personal_info?.linkedin?.replace("linked:", "")
    },
    experience: Array.isArray(data.experience)
      ? data.experience.map(exp => ({
          title: exp.title || exp.position || "",
          company: exp.company || "",
          startDate: exp.startDate || exp.start_date || "",
          endDate: exp.endDate || exp.end_date || (exp.is_current ? "Present" : ""),
          description: Array.isArray(exp.description) ? exp.description.join("\n") : exp.description || ""
        }))
      : [],
    project: Array.isArray(data.project)
      ? data.project.map(proj => ({
          ...proj,
          description: Array.isArray(proj.description) ? proj.description.join('\n') : (proj.description || "")
        }))
      : [],
    education: Array.isArray(data.education) ? data.education : []
  }), [data]);

  // Determine active typography & spacing classes based on auto or manual settings
  const dynamicTypographyClass = useMemo(() => {
    let mode = fontScale;

    // Automatic calculation based on character and entry counts
    if (fontScale === 'auto') {
      const summaryLen = sanitizedData.professional_summary?.length || 0;
      const expCount = sanitizedData.experience?.length || 0;
      const projCount = sanitizedData.project?.length || 0;
      const eduCount = sanitizedData.education?.length || 0;

      const score = summaryLen + (expCount * 140) + (projCount * 120) + (eduCount * 80);

      if (score < 400) mode = 'large';
      else if (score > 900) mode = 'small';
      else mode = 'normal';
    }

    switch (mode) {
      case 'small':
        // Compact mode for dense content
        return "[&_*]:!text-[10.5px] [&_h1]:!text-xl [&_h2]:!text-sm [&_p]:!leading-snug [&_li]:!leading-snug [&_section]:!mb-2.5";
      
      case 'large':
        // Expanded mode for short content (fills empty whitespace)
        return "[&_*]:!text-[13.5px] [&_h1]:!text-3xl [&_h2]:!text-xl [&_p]:!leading-relaxed [&_li]:!leading-relaxed [&_section]:!mb-6";
      
      case 'normal':
      default:
        // Balanced default standard sizes
        return "[&_*]:!text-[12px] [&_h1]:!text-2xl [&_h2]:!text-base [&_p]:!leading-normal [&_li]:!leading-normal [&_section]:!mb-4";
    }
  }, [sanitizedData, fontScale]);

  // Render active template
  const renderTemplate = () => {
    switch(template){
      case "modern": return <ModernTemplate data={sanitizedData} accentColor={accentColor}/>;
      case "minimal": return <MinimalTemplate data={sanitizedData} accentColor={accentColor}/>;
      case "minimal-image": return <MinimalImageTemplate data={sanitizedData} accentColor={accentColor}/>;
      case "professional": return <ProfessionalTemplate data={sanitizedData} accentColor={accentColor}/>;
      default: return <ClassicTemplate data={sanitizedData} accentColor={accentColor}/>;
    }
  };

  return (
    <div className={`w-full min-h-[297mm] bg-white text-left box-border p-6 shadow-sm ${dynamicTypographyClass}`}>
        {renderTemplate()}
    </div>
  );
};

export default ResumePreview;