import React from 'react';

const MinimalTemplate = ({ data, accentColor }) => {
    
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
                <li key={i} className="mb-0.5 list-none before:content-['•'] before:mr-3 before:text-gray-400 text-gray-800 font-medium">
                    {bullet.trim()}
                </li>
            ));
    };

    return (
        // A4 CONTAINER
        <div className="w-[210mm] min-h-[297mm] mx-auto px-8 py-10 bg-white text-gray-900 font-sans text-sm shadow-lg print:shadow-none overflow-hidden break-words">
            
            {/* HEADER SECTION */}
            <header className="mb-8">
                <h1 className="text-4xl font-bold mb-3 tracking-tight uppercase text-gray-950" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600 font-bold uppercase tracking-widest items-center">
                    {data.personal_info?.email && (
                        <span className="border-r-2 border-gray-300 pr-4 last:border-0">{data.personal_info.email}</span>
                    )}
                    {data.personal_info?.phone && (
                        <span className="border-r-2 border-gray-300 pr-4 last:border-0">{data.personal_info.phone}</span>
                    )}
                    {data.personal_info?.location && (
                        <span className="border-r-2 border-gray-300 pr-4 last:border-0">{data.personal_info.location}</span>
                    )}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center last:border-0">
                            <span className="text-gray-500 lowercase mr-1 font-semibold">li /</span>
                            <span className="text-gray-800 font-bold">
                                {data.personal_info.linkedin.includes(':') 
                                    ? data.personal_info.linkedin.split(':').pop() 
                                    : "LinkedIn"}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* PROFESSIONAL SUMMARY */}
            {data.professional_summary && (
                <section className="mb-8 border-l-4 pl-6" style={{ borderColor: `${accentColor}40` }}>
                    <p className="text-gray-700 leading-relaxed text-sm font-medium italic">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* EXPERIENCE SECTION */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xs uppercase tracking-[0.2em] mb-6 font-extrabold text-gray-400 border-b-2 pb-1 border-gray-100">
                        Professional Experience
                    </h2>

                    <div className="space-y-6">
                        {data.experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-lg font-bold text-gray-900">{exp.position || exp.title}</h3>
                                    <span className="text-xs text-gray-500 font-bold tabular-nums bg-gray-50 px-2 py-0.5 rounded">
                                        {formatDate(exp.startDate || exp.start_date)} — {exp.is_current ? "Present" : formatDate(exp.endDate || exp.end_date)}
                                    </span>
                                </div>
                                <p className="text-xs uppercase tracking-wider mb-2 font-bold" style={{ color: accentColor }}>
                                    {exp.company}
                                </p>
                                <ul className="text-gray-700 leading-snug text-sm space-y-1 pl-1">
                                    {renderBullets(exp.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS SECTION */}
            {data.project && data.project.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xs uppercase tracking-[0.2em] mb-6 font-extrabold text-gray-400 border-b-2 pb-1 border-gray-100">
                        Selected Work
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {data.project.map((proj, index) => (
                            <div key={index} className="group">
                                <h3 className="text-sm font-bold mb-1 uppercase tracking-tight text-gray-900">
                                    {proj.name}
                                </h3>
                                <div className="text-gray-700 text-xs leading-normal font-medium">
                                    {renderBullets(proj.description)}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* FOOTER GRID: EDUCATION & SKILLS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-2 pt-8 border-gray-100">
                {/* Education */}
                {data.education && data.education.length > 0 && (
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.2em] mb-5 font-extrabold text-gray-400">
                            Education
                        </h2>
                        <div className="space-y-4">
                            {data.education.map((edu, index) => edu.institution && (
                                <div key={index}>
                                    <h3 className="font-bold text-gray-900 text-sm mb-0.5">
                                        {edu.degree} {edu.field && `in ${edu.field}`}
                                    </h3>
                                    <p className="text-gray-600 text-xs mb-0.5 uppercase tracking-wide font-bold">{edu.institution}</p>
                                    <div className="flex justify-between text-xs text-gray-500 font-medium">
                                        <span>{formatDate(edu.graduationDate || edu.graduation_date)}</span>
                                        {edu.gpa && <span className="text-gray-800 font-bold">GPA {edu.gpa}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {data.skills && data.skills.length > 0 && (
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.2em] mb-5 font-extrabold text-gray-400">
                            Core Competencies
                        </h2>
                        <div className="text-gray-800 text-sm leading-relaxed font-semibold flex flex-wrap gap-x-3 gap-y-2">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200">
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