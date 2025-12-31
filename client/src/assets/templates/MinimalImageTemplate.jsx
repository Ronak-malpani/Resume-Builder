import React from 'react';
import { Mail, Phone, MapPin } from "lucide-react";

/**
 * Helper to safely render bullet descriptions
 */
const renderBullets = (description) => {
  if (!description) return null;

  const lines = Array.isArray(description)
    ? description
    : typeof description === "string"
    ? description.split("\n")
    : [];

  return (
    <ul className="list-disc list-outside ml-4 text-xs text-zinc-700 leading-relaxed space-y-1">
      {lines.map((line, i) => (
        <li key={i} className="pl-1">{line}</li>
      ))}
    </ul>
  );
};

const MinimalImageTemplate = ({ data, accentColor }) => {
  
  // ROBUST DATE FORMATTER
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
        if (dateStr.length === 4) return dateStr;
        const parts = dateStr.split("-");
        const year = parts[0];
        const monthIndex = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
        const date = new Date(year, monthIndex);
        if(isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    } catch (e) { return dateStr; }
  };

  return (
    // A4 CONTAINER
    <div className="w-[210mm] min-h-[297mm] bg-white text-zinc-800 font-sans shadow-lg print:shadow-none overflow-hidden break-words">
      
      {/* MAIN GRID */}
      <div className="grid grid-cols-12 min-h-[297mm]">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="col-span-4 border-r border-zinc-200 bg-zinc-50/30 flex flex-col">
            
            {/* IMAGE SECTION */}
            <div className="p-8 pb-4 flex justify-center">
                {data.personal_info?.image ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-sm" style={{ borderColor: accentColor + "20" }}>
                        <img
                            src={
                                typeof data.personal_info.image === "string"
                                ? data.personal_info.image
                                : URL.createObjectURL(data.personal_info.image)
                            }
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="w-32 h-32 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-400 text-xs">
                        No Image
                    </div>
                )}
            </div>

            {/* SIDEBAR CONTENT */}
            <div className="p-6 space-y-8">
                
                {/* CONTACT */}
                <section>
                    <h2 className="text-xs font-bold tracking-widest text-zinc-500 mb-4 border-b pb-1">
                        CONTACT
                    </h2>
                    <div className="space-y-3 text-xs font-medium text-zinc-700">
                        {data.personal_info?.phone && (
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 rounded-full bg-white shadow-sm text-zinc-500">
                                    <Phone size={12} style={{ color: accentColor }} />
                                </span>
                                <span>{data.personal_info.phone}</span>
                            </div>
                        )}
                        {data.personal_info?.email && (
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 rounded-full bg-white shadow-sm text-zinc-500">
                                    <Mail size={12} style={{ color: accentColor }} />
                                </span>
                                <span className="break-all">{data.personal_info.email}</span>
                            </div>
                        )}
                        {data.personal_info?.location && (
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 rounded-full bg-white shadow-sm text-zinc-500">
                                    <MapPin size={12} style={{ color: accentColor }} />
                                </span>
                                <span>{data.personal_info.location}</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* EDUCATION */}
                {data.education?.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold tracking-widest text-zinc-500 mb-4 border-b pb-1">
                            EDUCATION
                        </h2>
                        <div className="space-y-4">
                            {data.education.map((edu, index) => (
                                <div key={index}>
                                    <p className="font-bold text-xs text-zinc-800 uppercase leading-snug">
                                        {edu.degree}
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-0.5">{edu.institution}</p>
                                    <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                                        {/* FIXED: Checks for graduationDate OR graduation_date */}
                                        {formatDate(edu.graduationDate || edu.graduation_date)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SKILLS */}
                {data.skills?.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold tracking-widest text-zinc-500 mb-4 border-b pb-1">
                            SKILLS
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((skill, index) => (
                                <span 
                                    key={index} 
                                    className="text-xs px-2 py-1 bg-white border border-zinc-100 rounded shadow-sm text-zinc-700"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </aside>


        {/* ================= RIGHT CONTENT ================= */}
        <main className="col-span-8 flex flex-col">
            
            {/* HEADER NAME */}
            <div className="px-8 py-10 flex flex-col justify-center border-b border-zinc-100">
                <h1 className="text-4xl font-bold text-zinc-800 tracking-wide uppercase leading-none mb-2" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>
                <p className="text-sm font-semibold tracking-[0.2em] text-zinc-400 uppercase">
                    {data.personal_info?.profession || "Profession"}
                </p>
            </div>

            {/* MAIN SECTIONS */}
            <div className="p-8 space-y-8">
                
                {/* SUMMARY */}
                {data.professional_summary && (
                    <section>
                        <h2 className="text-sm font-bold tracking-widest mb-3 uppercase flex items-center gap-2" style={{ color: accentColor }}>
                            About Me
                        </h2>
                        <p className="text-sm text-zinc-600 leading-relaxed text-justify">
                            {data.professional_summary}
                        </p>
                    </section>
                )}

                {/* EXPERIENCE */}
                {data.experience?.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold tracking-widest mb-4 uppercase flex items-center gap-2" style={{ color: accentColor }}>
                            Experience
                        </h2>

                        <div className="space-y-6">
                            {data.experience.map((exp, index) => (
                                <div key={index} className="relative pl-4 border-l-2 border-zinc-100">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-bold text-sm text-zinc-800 uppercase">
                                            {exp.position || exp.title}
                                        </h3>
                                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded whitespace-nowrap">
                                            {/* FIXED: Checks for startDate OR start_date */}
                                            {formatDate(exp.startDate || exp.start_date)} – {exp.is_current ? "Present" : formatDate(exp.endDate || exp.end_date)}
                                        </span>
                                    </div>

                                    <p className="text-xs font-semibold mb-2 text-zinc-500">
                                        {exp.company}
                                    </p>

                                    {renderBullets(exp.description)}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* PROJECTS */}
                {data.project?.length > 0 && (
                    <section>
                        <h2 className="text-sm font-bold tracking-widest mb-4 uppercase flex items-center gap-2" style={{ color: accentColor }}>
                            Projects
                        </h2>

                        <div className="space-y-5">
                            {data.project.map((project, index) => (
                                <div key={index} className="relative pl-4 border-l-2 border-zinc-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-sm text-zinc-800 uppercase">
                                            {project.name}
                                        </h3>
                                    </div>
                                    
                                    {renderBullets(project.description)}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </main>

      </div>
    </div>
  );
};

export default MinimalImageTemplate;