import React from "react";

const ProfessionalTemplate = ({ data, accentColor }) => {
  // Utility to format date strings (handles the August month offset fix)
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

  /**
   * FIX: Helper to handle both String and Array descriptions
   * This resolves the "split is not a function" error.
   */
  const renderBullets = (description) => {
    if (!description) return null;

    let bulletArray = [];
    if (Array.isArray(description)) {
      // If it's already an array, use it directly (or split strings within it if they have newlines)
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
    <div className="max-w-3xl mx-auto bg-white text-black font-serif text-[15px] leading-relaxed p-8 shadow-md min-h-[11in]">
      {/* Header */}
      <header className="text-center mb-6 border-b-2 pb-3" style={{ borderColor: accentColor || '#000' }}>
        <h1 className="text-3xl font-bold uppercase tracking-wide" style={{ color: accentColor || '#000' }}>
          {data.personal_info?.full_name || "Your Name"}
        </h1>
        <div className="mt-1 text-sm flex flex-wrap justify-center gap-2 text-gray-700 font-medium">
          {data.personal_info?.email && <span>{data.personal_info.email}</span>}
          {data.personal_info?.email && (data.personal_info?.phone || data.personal_info?.linkedin) && <span>|</span>}
          
          {data.personal_info?.phone && <span>{data.personal_info.phone}</span>}
          {data.personal_info?.phone && data.personal_info?.linkedin && <span>|</span>}

          {data.personal_info?.linkedin && (
            <a href={data.personal_info.linkedin} className="hover:underline">
              {data.personal_info.linkedin.includes(':') ? data.personal_info.linkedin.split(':').pop() : "LinkedIn"}
            </a>
          )}
          {data.personal_info?.website && <span> | {data.personal_info.website}</span>}
        </div>
      </header>

      {/* Professional Summary */}
      {data.professional_summary && (
        <section className="mb-6">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2 tracking-widest text-sm">
            Professional Summary
          </h2>
          <p className="text-justify text-[13.5px] text-gray-800">
            {data.professional_summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2 tracking-widest text-sm">
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900">{exp.position}</h3>
                <span className="text-xs font-bold text-gray-600 uppercase">
                  {formatDate(exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.end_date)}
                </span>
              </div>
              <div className="flex justify-between italic text-gray-800 text-[14px] mb-1">
                <span>{exp.company}</span>
                {exp.location && <span className="not-italic text-gray-500">{exp.location}</span>}
              </div>
              <ul className="list-disc pl-5 text-[13px] text-gray-700 space-y-0.5">
                {renderBullets(exp.description)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.project && data.project.length > 0 && (
        <section className="mb-6">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2 tracking-widest text-sm">
            Projects
          </h2>
          {data.project.map((p, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-bold text-sm text-gray-900 uppercase">{p.name}</h3>
              <ul className="list-disc pl-5 text-[13px] text-gray-700">
                {renderBullets(p.description)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2 tracking-widest text-sm">
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-bold text-gray-900">
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </h3>
                <span className="text-xs font-bold text-gray-600">
                  {formatDate(edu.graduation_date)}
                </span>
              </div>
              <div className="flex justify-between italic text-gray-700 text-[14px]">
                <span>{edu.institution}</span>
                {edu.gpa && <span className="not-italic font-semibold">GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="uppercase font-bold border-b border-gray-400 text-gray-900 mb-2 tracking-widest text-sm">
            Technical Skills
          </h2>
          <p className="text-[13px] text-gray-800">
            {data.skills.join(" • ")}
          </p>
        </section>
      )}
    </div>
  );
};

export default ProfessionalTemplate;