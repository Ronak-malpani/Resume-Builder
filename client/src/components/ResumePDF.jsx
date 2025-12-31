import React from 'react';
import ResumePreview from './ResumePreview';

const ResumePDF = ({ data, template, accentColor }) => {
  return (
    // We set a fixed width for A4 printing context
    <div style={{ width: '210mm', minHeight: '297mm', backgroundColor: 'white' }}>
      <ResumePreview 
        data={data} 
        template={template} 
        accentColor={accentColor} 
        isPDF={true} // Optional: Pass this if you want to hide buttons/links in the PDF
      />
    </div>
  );
};

export default ResumePDF;