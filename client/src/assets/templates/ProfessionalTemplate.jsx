import React from "react";

const ProfessionalTemplate = ({ data, accentColor }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const parts = dateStr.split("-");
      const month = parseInt(parts[1], 10) - 1;
      return new Date(parts[0], month).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch (e) {
      return dateStr;
    }
  };

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
    /* Increased base font to 14px and adjusted padding */
    <div className="max-w-4xl mx-auto bg-white text-black font-serif text-[14px] leading-snug p-8 shadow-md min-h-screen lg:min-h-[11in] print:shadow-none print:p-6">
      
      {/* Header - Scaled up name */}
      <header className="text-center mb-5 border-b-2 pb-2" style={{ borderColor: accentColor || '#000' }}>
        <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ color: accentColor || '#000' }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        <div className="mt-1 text-[12.5px] flex flex-wrap justify-center gap-x-4 gap-y-1 text-gray-700 font-medium">
          {data.personal_info?.email && <span>{data.personal_info.email}</span>}
          {data.personal_info?.phone && <span>| {data.personal_info.phone}</span>}
          {data.personal_info?.linkedin && (
            <span className="hover:underline">
              | {data.personal_info.linkedin.includes(':') ? data.personal_info.linkedin.split(':').pop() : "LinkedIn"}
            </span>
          )}
          {data.personal_info?.website && <span>| {data.personal_info.website}</span>}
        </div>
      </header>

      {/* Professional Summary - Increased summary text size */}
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

      {/* Experience - Increased heading and bullet size */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2.5 tracking-widest text-[12.5px]">
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900 text-[14.5px]">{exp.position}</h3>
                <span className="text-[11px] font-bold text-gray-600 uppercase">
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
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

      {/* Projects - Scaled up project names */}
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

      {/* Education - Scaled up degree text */}
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
                  {formatDate(edu.graduation_date)}
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

      {/* Skills - Increased skill text */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-4">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2 tracking-widest text-[12.5px]">
            Skills
          </h2>
          <p className="text-[13px] text-gray-800 leading-relaxed">
            {data.skills.join(" • ")}
          </p>
        </section>
      )}
    </div>
  );
};

export default ProfessionalTemplate;