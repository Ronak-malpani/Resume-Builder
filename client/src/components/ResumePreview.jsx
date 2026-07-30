import React, { useMemo } from 'react';
import ClassicTemplate from '../assets/templates/ClassicTemplate';
import ModernTemplate from '../assets/templates/ModernTemplate';
import MinimalTemplate from '../assets/templates/MinimalTemplate';
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate';
import ProfessionalTemplate from '../assets/templates/ProfessionalTemplate';

const ResumePreview = ({ 
  data, 
  template, 
  accentColor, 
  baseFontSize = 12, 
  onElementClick 
}) => {
  
  // Data Sanitization & Formatting Preserver
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
          description: exp.description || ""
        }))
      : [],
    project: Array.isArray(data.project)
      ? data.project.map(proj => ({
          ...proj,
          description: proj.description || ""
        }))
      : [],
    education: Array.isArray(data.education) ? data.education : []
  }), [data]);

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
    <div 
      onClick={(e) => onElementClick && onElementClick(e)}
      style={{ fontSize: `${baseFontSize}px` }}
      className="w-full h-fit min-h-0 bg-white text-left box-border select-text cursor-pointer"
    >
      {renderTemplate()}
    </div>
  );
};

export default ResumePreview;