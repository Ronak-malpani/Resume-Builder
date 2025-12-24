/* components/templates/ClassicTemplate.jsx */
import React from 'react';
import { Mail, Phone, Linkedin } from "lucide-react";

const ClassicTemplate = ({ data, accentColor }) => {

    
    // Improved date formatting to handle MongoDB strings
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        try {
            const parts = dateStr.split("-");
            const year = parts[0];
            const monthIndex = parseInt(parts[1], 10) - 1;
            
            // Returns formatted string like "Jul 2023"
            const date = new Date(year, monthIndex);
            return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    // Robust bullet renderer to handle the description strings from your DB
    const renderBullets = (description) => {
        if (!description || typeof description !== 'string') return null;

        return description
            .split('\n')
            .map(line => line.trim())
            .filter(line => line !== "")
            .map((bullet, i) => (
                <li key={i} className="pl-1 mb-1 list-disc ml-4 text-[12.5px] text-gray-600">
                    {bullet}
                </li>
            ));
    };

    const hasEducation = data.education && data.education.length > 0 && data.education.some(edu => edu.institution?.trim());

    return (
        <div className="max-w-4xl mx-auto p-12 bg-white text-gray-800 shadow-lg min-h-[11in] font-serif print:shadow-none print:p-8">
            
            {/* HEADER SECTION */}
            <header className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: accentColor }}>
                <h1 className="text-4xl font-bold mb-3 uppercase tracking-tighter" style={{ color: accentColor }}>
                    {data.personal_info?.full_name || "Your Name"}
                </h1>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-gray-600 font-medium">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1.5">
                            <Mail size={14} style={{ color: accentColor }}/>
                            {data.personal_info.email}
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone size={14} style={{ color: accentColor }}/>
                            {data.personal_info.phone}
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <div className="flex items-center gap-1.5">
                            <Linkedin size={14} style={{ color: accentColor }}/>
                            <span className="text-gray-800">{data.personal_info.linkedin}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* PROFESSIONAL SUMMARY */}
            {data.professional_summary && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-2 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Professional Summary
                    </h2>
                    <p className="text-[12.5px] text-gray-600 leading-relaxed italic">
                        {data.professional_summary}
                    </p>
                </section>
            )}

            {/* TECHNICAL SKILLS */}
            {data.skills && data.skills.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Technical Skills
                    </h2>
                    <p className="text-[12.5px] text-gray-600 leading-relaxed">
                        {data.skills.join(" • ")}
                    </p>
                </section>
            )}

            {/* EXPERIENCE SECTION - This is the primary fix for your MongoDB data */}
            {data.experience && data.experience.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-4 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Professional Experience
                    </h2>
                    <div className="space-y-6">
                        {data.experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="text-[15px] font-bold text-gray-900 uppercase">
                                        {exp.position || "Position Title"}
                                    </h3>
                                    <span className="text-xs font-bold text-gray-500 tabular-nums uppercase">
                                        {formatDate(exp.start_date)} — {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </span>
                                </div>
                                <div className="text-sm font-semibold italic text-gray-700 mb-2">
                                    {exp.company}
                                </div>
                                <ul className="list-disc ml-5 text-[12.5px] text-gray-600 space-y-1.5 leading-snug">
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
                    <h2 className="text-lg font-bold mb-4 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Key Projects
                    </h2>
                    <div className="space-y-5">
                        {data.project.map((proj, index) => (
                            <div key={index} className="pl-4 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                                <h3 className="font-bold text-gray-900 text-sm uppercase">{proj.name}</h3>
                                <ul className="list-disc ml-4 mt-2 text-[12px] text-gray-600 space-y-1">
                                    {renderBullets(proj.description)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* EDUCATION SECTION */}
            {hasEducation && (
                <section className="mb-8">
                    <h2 className="text-lg font-bold mb-3 border-b uppercase tracking-widest" style={{ color: accentColor }}>
                        Education
                    </h2>
                    <div className="space-y-4">
                        {data.education.map((edu, index) => edu.institution && (
                            <div key={index} className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-[14px] text-gray-900">{edu.degree} {edu.field ? `in ${edu.field}` : ""}</h3>
                                    <p className="text-sm text-gray-700">{edu.institution}</p>
                                    {edu.gpa && <p className="text-xs text-gray-500">GPA: <span className="font-bold">{edu.gpa}</span></p>}
                                </div>
                                <span className="text-xs font-bold text-gray-500 tabular-nums">
                                    {formatDate(edu.graduation_date)}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ClassicTemplate;