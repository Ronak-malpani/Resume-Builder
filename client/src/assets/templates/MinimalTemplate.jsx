import React from 'react';

const MinimalTemplate = ({ data, accentColor }) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            const parts = dateStr.split("-");
            const month = parseInt(parts[1], 10) - 1;
            return new Date(parts[0], month).toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "short" 
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
                <li key={i} className="mb-0.5 list-none before:content-['•'] before:mr-3 before:text-gray-300">
                    {bullet.trim()}
                </li>
            ));
    };

    return (
        /* Reduced vertical padding from p-12 to p-8 */
        <div className="max-w-4xl mx-auto p-8 bg-white text-gray-900 font-light min-h-screen lg:min-h-[11in] print:p-6">
            
            {/* HEADER SECTION - Tightened mb-12 to mb-8 */}
            <header className="mb-8">
                <h1 className="text-4xl font-extralight mb-4 tracking-tight uppercase" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-gray-500 uppercase tracking-widest items-center">
                    {data.personal_info?.email && (
                        <span className="border-r border-gray-200 pr-6 last:border-0">{data.personal_info.email}</span>
                    )}
                    {data.personal_info?.phone && (
                        <span className="border-r border-gray-200 pr-6 last:border-0">{data.personal_info.phone}</span>
                    )}
                    {data.personal_info?.location && (
                        <span className="border-r border-gray-200 pr-6 last:border-0">{data.personal_info.location}</span>
                    )}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center last:border-0">
                            <span className="text-gray-400 lowercase mr-1">li /</span>
                            <span className="text-gray-700 font-medium">
                                {data.personal_info.linkedin.includes(':') 
                                    ? data.personal_info.linkedin.split(':').pop() 
                                    : "LinkedIn"}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* PROFESSIONAL SUMMARY - Tightened mb-12 to mb-8 */}
            {data.professional_summary && (
                <section className="mb-8 border-l-2 pl-6" style={{ borderColor: `${accentColor}20` }}>
                    <p className="text-gray-600 leading-relaxed text-md font-light italic">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* EXPERIENCE SECTION - Reduced spacing between items */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-[10px] uppercase tracking-[0.3em] mb-6 font-bold opacity-50">
                        Professional Experience
                    </h2>

                    <div className="space-y-6">
                        {data.experience.map((exp, index) => exp.company && (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-normal">{exp.position}</h3>
                                    <span className="text-xs text-gray-400 font-light tabular-nums">
                                        {formatDate(exp.start_date)} — {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: accentColor }}>
                                    {exp.company}
                                </p>
                                <ul className="text-gray-600 leading-snug text-[13px] space-y-0.5">
                                    {renderBullets(exp.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS SECTION - Used 2-column grid to save vertical height */}
            {data.project && data.project.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-[10px] uppercase tracking-[0.3em] mb-6 font-bold opacity-50">
                        Selected Work
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                        {data.project.map((proj, index) => (
                            <div key={index} className="group">
                                <h3 className="text-sm font-medium mb-1 uppercase tracking-tight">
                                    {proj.name}
                                </h3>
                                <ul className="text-gray-600 text-xs leading-normal">
                                    {renderBullets(proj.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* EDUCATION & SKILLS FOOTER GRID - Crucial for 1-page fit */}
            <div className="resume-grid border-t pt-8" style={{ borderColor: `${accentColor}10` }}>
                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <section>
                        <h2 className="text-[10px] uppercase tracking-[0.3em] mb-6 font-bold opacity-50">
                            Education
                        </h2>
                        <div className="space-y-4">
                            {data.education.map((edu, index) => edu.institution && (
                                <div key={index}>
                                    <h3 className="font-medium text-gray-800 text-[13px] mb-0.5">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-gray-500 text-[11px] mb-0.5 uppercase tracking-tighter">{edu.institution}</p>
                                    <div className="flex justify-between text-[10px] text-gray-400 font-light">
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
                        <h2 className="text-[10px] uppercase tracking-[0.3em] mb-6 font-bold opacity-50">
                            Core Competencies
                        </h2>
                        <div className="text-gray-600 text-[13px] leading-relaxed text-left font-normal flex flex-wrap gap-x-3 gap-y-1">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="after:content-['•'] after:ml-3 last:after:content-none after:text-gray-200">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}

export default MinimalTemplate;