import React, { useMemo } from 'react';
import ClassicTemplate from '../assets/templates/ClassicTemplate';
import ModernTemplate from '../assets/templates/ModernTemplate';
import MinimalTemplate from '../assets/templates/MinimalTemplate';
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate';
import ProfessionalTemplate from '../assets/templates/ProfessionalTemplate';

const ResumePreview = ({ data, template, accentColor, classes = "" }) => {
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

  const sections = ["personal_info", "professional_summary", "experience", "education", "project", "skills"];
  const completedSections = sections.filter(sec => {
    const val = sanitizedData[sec];
    return val && (Array.isArray(val) ? val.length > 0 : true);
  });
  const progress = Math.round((completedSections.length / sections.length) * 100);

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
    /* Use 'resume-container' for mobile-friendly scaling */
    <div className='w-full bg-gray-100 flex justify-center p-0 md:p-4 print:p-0'>
      <div 
        id="resume-preview" 
        className={`w-full max-w-full md:max-w-[8.5in] bg-white transition-all duration-300 
        print:shadow-none print:border-none print:m-0 shadow-sm ${classes}`}
      >
        {/* Progress Bar - Hidden when printing */}
        <div className="w-full bg-gray-200 h-1 print:hidden">
          <div
            className="bg-green-500 h-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* The template itself must use responsive layout utilities (flex-wrap, grid-cols-1 md:grid-cols-2) */}
        <div className="responsive-template-wrapper">
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;