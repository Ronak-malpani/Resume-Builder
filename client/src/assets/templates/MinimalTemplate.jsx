/* components/templates/MinimalTemplate.jsx */
import React from 'react';

const MinimalTemplate = ({ data, accentColor }) => {
    // FIX 1: Corrected Date Logic for 0-indexed months (The "August" fix)
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            const parts = dateStr.split("-");
            // Subtracting 1 from parts[1] so that "08" correctly becomes August
            const month = parseInt(parts[1], 10) - 1;
            return new Date(parts[0], month).toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "short" 
            });
        } catch (e) {
            return dateStr;
        }
    };

    // FIX 2: Bullet renderer to handle [String] arrays from your MongoDB Schema
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
                <li key={i} className="mb-1 list-none before:content-['•'] before:mr-3 before:text-gray-300">
                    {bullet.trim()}
                </li>
            ));
    };

    return (
        <div className="max-w-4xl mx-auto p-12 bg-white text-gray-900 font-light min-h-[11in] print:p-8">
            
            {/* HEADER SECTION */}
            <header className="mb-12">
                <h1 className="text-5xl font-extralight mb-6 tracking-tight uppercase" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13px] text-gray-500 uppercase tracking-widest items-center">
                    {data.personal_info?.email && (
                        <span className="border-r border-gray-200 pr-8 last:border-0">{data.personal_info.email}</span>
                    )}
                    {data.personal_info?.phone && (
                        <span className="border-r border-gray-200 pr-8 last:border-0">{data.personal_info.phone}</span>
                    )}
                    {data.personal_info?.location && (
                        <span className="border-r border-gray-200 pr-8 last:border-0">{data.personal_info.location}</span>
                    )}
                    
                    {/* FIX 3: Force LinkedIn Visibility and handle "linked:asdf" format */}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center border-r border-gray-200 pr-8 last:border-0">
                            <a 
                                href={data.personal_info.linkedin} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline text-gray-700 font-medium"
                            >
                                <span className="text-gray-400 lowercase mr-1">li /</span>
                                {data.personal_info.linkedin.includes(':') 
                                    ? data.personal_info.linkedin.split(':').pop() 
                                    : "LinkedIn"}
                            </a>
                        </div>
                    )}
                    
                    {data.personal_info?.website && (
                        <a href={data.personal_info.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-gray-700 font-medium">
                            Portfolio
                        </a>
                    )}
                </div>
            </header>

            {/* PROFESSIONAL SUMMARY */}
            {data.professional_summary && (
                <section className="mb-12 border-l-2 pl-6" style={{ borderColor: `${accentColor}20` }}>
                    <p className="text-gray-600 leading-relaxed text-lg font-light italic">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* EXPERIENCE SECTION */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-xs uppercase tracking-[0.3em] mb-8 font-bold opacity-50">
                        Professional Experience
                    </h2>

                    <div className="space-y-10">
                        {data.experience.map((exp, index) => exp.company && (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-2">
                                    <h3 className="text-xl font-normal">{exp.position}</h3>
                                    <span className="text-sm text-gray-400 font-light tabular-nums">
                                        {formatDate(exp.start_date)} — {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-sm uppercase tracking-wider mb-4" style={{ color: accentColor }}>
                                    {exp.company}
                                </p>
                                <ul className="text-gray-600 leading-relaxed text-[14px] space-y-1">
                                    {renderBullets(exp.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS SECTION */}
            {data.project && data.project.length > 0 && (
                <section className="mb-12">
                    <h2 className="text-xs uppercase tracking-[0.3em] mb-8 font-bold opacity-50">
                        Selected Work
                    </h2>

                    <div className="grid grid-cols-1 gap-8">
                        {data.project.map((proj, index) => (
                            <div key={index} className="group">
                                <h3 className="text-md font-medium mb-2 uppercase tracking-tight">
                                    {proj.name}
                                </h3>
                                <ul className="text-gray-600 text-sm">
                                    {renderBullets(proj.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* EDUCATION & SKILLS FOOTER GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] mb-8 font-bold opacity-50">
                            Education
                        </h2>
                        <div className="space-y-6">
                            {data.education.map((edu, index) => edu.institution && (
                                <div key={index}>
                                    <h3 className="font-medium text-gray-800 text-sm mb-1">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-gray-500 text-xs mb-1 uppercase tracking-tighter">{edu.institution}</p>
                                    <div className="flex justify-between text-[11px] text-gray-400 font-light">
                                        <span>{formatDate(edu.graduation_date)}</span>
                                        {edu.gpa && <span>GPA {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {data.skills && data.skills.length > 0 && (
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] mb-8 font-bold opacity-50">
                            Core Competencies
                        </h2>
                        <div className="text-gray-600 text-sm leading-loose text-left font-normal">
                            {data.skills.join(" • ")}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default MinimalTemplate;