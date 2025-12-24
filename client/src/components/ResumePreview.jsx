import React from 'react'
import ClassicTemplate from '../assets/templates/ClassicTemplate'
import ModernTemplate from '../assets/templates/ModernTemplate'
import MinimalTemplate from '../assets/templates/MinimalTemplate'
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate'
import ProfessionalTemplate from '../assets/templates/ProfessionalTemplate';

const ResumePreview = ({data, template, accentColor, classes =""}) => {

console.log(" ResumePreview received data:", data);
  
  /**
   * DATA SANITIZATION LAYER
   * This fixes the "Vanished Info" issue by ensuring that even if MongoDB 
   * returns an array or a string, the template receives what it needs.
   */
  const sanitizedData = {
    ...data,
    // Fix LinkedIn display centrally (Removes "linked:" prefix)
    personal_info: {
      ...data.personal_info,
      linkedin: data.personal_info?.linkedin?.replace("linked:", "")
    },

    // Ensure Experience handles the new String schema change
   experience: Array.isArray(data.experience)
  ? data.experience.map(exp => ({
      ...exp,

      // 🔥 NORMALIZE POSITION FIELD
      position:
        exp.position ||
        exp.role ||
        exp.title ||
        "",

      // normalize description
      description: Array.isArray(exp.description)
        ? exp.description.join("\n")
        : exp.description || ""
    }))
  : [],

    // Ensure Projects handle the new String schema change
    project: Array.isArray(data.project) ? data.project.map(proj => ({
      ...proj,
      // Convert old array descriptions to strings for the template
      description: Array.isArray(proj.description) ? proj.description.join('\n') : (proj.description || "")
    })) : [],

    // Safety check for education
    education: Array.isArray(data.education) ? data.education : []
  };

  const renderTemplate = () => {
    // We now pass 'sanitizedData' instead of raw 'data'
    switch(template){
        case "modern":
            return <ModernTemplate data={sanitizedData} accentColor={accentColor}/>;
        case "minimal":
            return <MinimalTemplate data={sanitizedData} accentColor={accentColor}/>;    
        case "minimal-image":
            return <MinimalImageTemplate data={sanitizedData} accentColor={accentColor}/>;
        case "professional":
            return <ProfessionalTemplate data={sanitizedData} accentColor={accentColor}/>;
        default:
            return <ClassicTemplate data={sanitizedData} accentColor={accentColor}/>;
    }
  }

  return (
    <div className='w-full bg-gray-100 flex justify-center overflow-x-hidden p-2 md:p-0'>
      <div id="resume-preview" className={`w-full max-w-full md:max-w-[8.5in] border border-gray-200 print:shadow-none print:border-none shadow-sm ${classes}`}>
        {renderTemplate()}
      </div>

      <style jsx="true">
        {`
        /* 1. Mobile Screen Scaling (Non-Print) */
        @media screen and (max-width: 640px) {
          #resume-preview {
            transform: scale(0.98);
            transform-origin: top center;
          }
        }

        /* 2. Professional Print Settings */
        @page {
          size: letter;
          margin: 0;
        }

        @media print {
          html, body {
            width: 8.5in;
            height: 11in;
            overflow: hidden;
            background: white;
          }
          
          body * {
            visibility: hidden;
          }

          #resume-preview, #resume-preview * {
            visibility: visible;
          }

          #resume-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
        }
      `}
      </style>
    </div>
  )
}

export default ResumePreview