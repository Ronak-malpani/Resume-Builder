import React from 'react';
import { Mail, Phone, Linkedin } from "lucide-react";

const ClassicTemplate = ({ data, accentColor }) => {
    
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
        if (!description || typeof description !== 'string') return null;
        return description
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== "")
            .map((bullet, i) => (
                <li key={i} className="pl-1 mb-0.5 list-disc ml-4 text-[12px] text-gray-700 leading-normal">
                    {bullet}
                </li>
            ));
    };

    const hasEducation = data.education && data.education.length > 0 && data.education.some(edu => edu.institution?.trim());

    return (
        // A4 CONTAINER
        <div className="w-[210mm] min-h-[297mm] mx-auto px-8 py-10 bg-white text-gray-800 shadow-lg font-serif print:shadow-none overflow-hidden break-words">
            
            {/* HEADER SECTION */}
            <header className="text-center mb-6 pb-4 border-b-2" style={{ borderColor: accentColor }}>
                <h1 className="text-3xl font-bold mb-2 uppercase tracking-tight" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[12px] text-gray-600 font-medium">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1.5">
                            <Mail size={13} style={{ color: accentColor }}/>
                            {data.personal_info.email}
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone size={13} style={{ color: accentColor }}/>
                            {data.personal_info.phone}
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center gap-1.5">
                            <Linkedin size={13} style={{ color: accentColor }}/>
                            <span className="text-gray-800">
                                {data.personal_info.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                            </span>
                        </div>
                    )}
                </div>
            </header>

            {/* PROFESSIONAL SUMMARY */}
            {data.professional_summary && (
                <section className="mb-5">
                    <h2 className="text-md font-bold mb-1.5 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Professional Summary
                    </h2>
                    <p className="text-[12px] text-gray-700 leading-relaxed italic text-justify">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* EXPERIENCE SECTION */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-5">
                    <h2 className="text-md font-bold mb-3 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Professional Experience
                    </h2>
                    <div className="space-y-4">
                        {data.experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-0">
                                    <h3 className="text-[14px] font-bold text-gray-900 uppercase">
                                        {exp.position || "Position Title"}
                                    </h3>
                                    <span className="text-[10px] font-bold text-gray-500 tabular-nums uppercase">
                                        {formatDate(exp.startDate || exp.start_date)} — {exp.is_current ? "Present" : formatDate(exp.endDate || exp.end_date)}
                                    </span>
                                </div>
                                <div className="text-[12px] font-semibold italic text-gray-700 mb-1">
                                    {exp.company}
                                </div>
                                <ul className="list-disc ml-5 space-y-0.5">
                                    {renderBullets(exp.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* PROJECTS SECTION */}
            {data.project && data.project.length > 0 && (
                <section className="mb-5">
                    <h2 className="text-md font-bold mb-3 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Key Projects
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {data.project.map((proj, index) => (
                            <div key={index} className="pl-3 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                                <h3 className="font-bold text-gray-900 text-[13px] uppercase">{proj.name}</h3>
                                <ul className="mt-1 space-y-0.5">
                                    {renderBullets(proj.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* DYNAMIC GRID: Education and Skills */}
            <div className="resume-grid border-t pt-4" style={{ borderColor: `${accentColor}20` }}>
                {/* EDUCATION */}
                {hasEducation && (
                    <section>
                        <h2 className="text-md font-bold mb-2 uppercase tracking-widest" style={{ color: accentColor }}>
                            Education
                        </h2>
                        <div className="space-y-3">
                            {data.education.map((edu, index) => edu.institution && (
                                <div key={index} className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-[13px] text-gray-900 leading-tight">
                                            {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                                        </h3>
                                        <p className="text-[11px] text-gray-700">{edu.institution}</p>
                                        {edu.gpa && <p className="text-[10px] text-gray-500">GPA: <span className="font-bold">{edu.gpa}</span></p>}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 tabular-nums whitespace-nowrap">
                                        {formatDate(edu.graduationDate || edu.graduation_date)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* SKILLS */}
                {data.skills && data.skills.length > 0 && (
                    <section>
                        <h2 className="text-md font-bold mb-2 uppercase tracking-widest" style={{ color: accentColor }}>
                            Technical Skills
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {data.skills.map((skill, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-700 border border-gray-100 rounded text-[10px] font-medium leading-none">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ClassicTemplate;