import React, { useMemo } from 'react';
import ClassicTemplate from '../assets/templates/ClassicTemplate';
import ModernTemplate from '../assets/templates/ModernTemplate';
import MinimalTemplate from '../assets/templates/MinimalTemplate';
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate';
import ProfessionalTemplate from '../assets/templates/ProfessionalTemplate';

const ResumePreview = ({ data, template, accentColor }) => {
  
  // 1. Data Sanitization (Kept from your code - ensures data is clean)
  const sanitizedData = useMemo(() => ({
    ...data,
    personal_info: {
      ...data.personal_info,
      // Handle edge case where linkedin might have "linked:" prefix
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

  // 2. Select Template Component
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
    // Clean wrapper. Removed progress bar so it doesn't show in PDF.
    <div className="w-full h-full bg-white text-left">
        {renderTemplate()}
    </div>
  );
};

export default ResumePreview;