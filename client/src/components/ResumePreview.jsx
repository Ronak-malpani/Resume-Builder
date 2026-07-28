import React, { useMemo } from 'react';
import ClassicTemplate from '../assets/templates/ClassicTemplate';
import ModernTemplate from '../assets/templates/ModernTemplate';
import MinimalTemplate from '../assets/templates/MinimalTemplate';
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate';
import ProfessionalTemplate from '../assets/templates/ProfessionalTemplate';

const ResumePreview = ({ data, template, accentColor, fontScale = 'normal' }) => {
  
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

  // Typography & Spacing class generation for S / M / L density
  const typographyClass = useMemo(() => {
    switch (fontScale) {
      case 'small':
        return "[&_*]:!text-[10px] [&_h1]:!text-lg [&_h2]:!text-xs [&_p]:!leading-snug [&_li]:!leading-snug [&_section]:!mb-2";
      case 'large':
        return "[&_*]:!text-[14px] [&_h1]:!text-3xl [&_h2]:!text-xl [&_p]:!leading-relaxed [&_li]:!leading-relaxed [&_section]:!mb-5";
      case 'normal':
      default:
        return "[&_*]:!text-[12px] [&_h1]:!text-2xl [&_h2]:!text-base [&_p]:!leading-normal [&_li]:!leading-normal [&_section]:!mb-3.5";
    }
  }, [fontScale]);

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
    <div className={`w-full h-auto min-h-0 bg-white text-left box-border p-6 shadow-xs ${typographyClass}`}>
        {renderTemplate()}
    </div>
  );
};

export default ResumePreview;