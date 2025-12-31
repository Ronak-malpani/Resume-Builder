import React from "react";

const ProfessionalTemplate = ({ data, accentColor }) => {
  
  // 1. ROBUST DATE FORMATTER
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
        if (dateStr.length === 4) return dateStr;
        const parts = dateStr.split("-");
        const year = parts[0];
        const monthIndex = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
        const date = new Date(year, monthIndex);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
        return dateStr;
    }
  };

  // 2. BULLET POINT RENDERER
  const renderBullets = (description) => {
    if (!description) return null;
    let bulletArray = [];
    if (Array.isArray(description)) {
      bulletArray = description.flatMap(item => 
        typeof item === 'string' ? item.split('\n') : item
      );
    } else if (typeof description === 'string') {
      bulletArray = description.split('\n');
    }

    return bulletArray
      .filter(line => line.trim() !== "")
      .map((bullet, i) => (
        <li key={i}>{bullet.trim()}</li>
      ));
  };

  return (
    // A4 CONTAINER
    <div className="w-[210mm] min-h-[297mm] mx-auto bg-white text-black font-serif text-[14px] leading-snug p-8 shadow-md print:shadow-none overflow-hidden break-words">
      
      {/* Header */}
      <header className="text-center mb-5 border-b-2 pb-3" style={{ borderColor: accentColor || '#000' }}>
        <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ color: accentColor || '#000' }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        <div className="mt-1 text-[12.5px] flex flex-wrap justify-center gap-x-4 gap-y-1 text-gray-700 font-medium">
          {data.personal_info?.email && <span>{data.personal_info.email}</span>}
          {data.personal_info?.phone && <span>| {data.personal_info.phone}</span>}
          {data.personal_info?.linkedin && (
            <span className="hover:underline">
              | {data.personal_info.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
            </span>
          )}
          {data.personal_info?.website && <span>| {data.personal_info.website}</span>}
        </div>
      </header>

      {/* Professional Summary */}
      {data.professional_summary && (
        <section className="mb-5">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-1.5 tracking-widest text-[12.5px]">
            Summary
          </h2>
          <p className="text-justify text-[13.5px] text-gray-800 leading-normal">
            {data.professional_summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2.5 tracking-widest text-[12.5px]">
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-[14.5px]">{exp.position || exp.title}</h3>
                <span className="text-[11px] font-bold text-gray-600 uppercase">
                  {formatDate(exp.startDate || exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.endDate || exp.end_date)}
                </span>
              </div>
              <div className="flex justify-between italic text-gray-800 text-[13.5px] mb-1">
                <span>{exp.company}</span>
                {exp.location && <span className="not-italic text-gray-500">{exp.location}</span>}
              </div>
              <ul className="list-disc pl-6 text-[13px] text-gray-700 space-y-1 leading-normal">
                {renderBullets(exp.description)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.project && data.project.length > 0 && (
        <section className="mb-5">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2.5 tracking-widest text-[12.5px]">
            Projects
          </h2>
          {data.project.map((p, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-bold text-[13.5px] text-gray-900 uppercase">{p.name}</h3>
              <ul className="list-disc pl-6 text-[13px] text-gray-700 space-y-0.5">
                {renderBullets(p.description)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-5">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2.5 tracking-widest text-[12.5px]">
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-[13.5px]">
                  {edu.degree}
                </h3>
                <span className="text-[11px] font-bold text-gray-600">
                  {formatDate(edu.graduationDate || edu.graduation_date)}
                </span>
              </div>
              <div className="flex justify-between text-gray-700 text-[13px]">
                <span>{edu.institution}</span>
                {edu.gpa && <span className="font-semibold italic">GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2 tracking-widest text-[12.5px]">
            Skills
          </h2>
          <p className="text-[13px] text-gray-800 leading-relaxed font-medium">
            {/* Added check for array to prevent crashes */}
            {Array.isArray(data.skills) ? data.skills.join(" • ") : ""}
          </p>
        </section>
      )}
    </div>
  );
};

export default ProfessionalTemplate;