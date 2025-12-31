import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";

const ModernTemplate = ({ data, accentColor }) => {
    
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
                <li key={i} className="mb-0.5 text-sm text-gray-700 leading-snug">
                    {bullet}
                </li>
            ));
    };

    const hasEducation = data.education && data.education.length > 0 && data.education.some(edu => edu.institution?.trim());

    return (
        // A4 CONTAINER
        <div className="w-[210mm] min-h-[297mm] bg-white text-gray-800 font-sans overflow-hidden break-words shadow-lg print:shadow-none">
            
            {/* HEADER - Reduced padding from py-7 to py-5 to shrink box height */}
            <header className="px-8 py-5 text-white" style={{ backgroundColor: accentColor }}>
                {/* Reduced margin-bottom from mb-2 to mb-1 */}
                <h1 className="text-4xl font-bold mb-1 uppercase tracking-wide leading-none">
                    {data.personal_info?.full_name || "Your Name"}
                </h1>

                <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm opacity-95 font-medium">
                    {data.personal_info?.email && (
                        <div className="flex items-center gap-1.5">
                            <Mail className="size-4 shrink-0" />
                            <span>{data.personal_info.email}</span>
                        </div>
                    )}
                    {data.personal_info?.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone className="size-4 shrink-0" />
                            <span>{data.personal_info.phone}</span>
                        </div>
                    )}
                    {data.personal_info?.location && (
                        <div className="flex items-center gap-1.5">
                            <MapPin className="size-4 shrink-0" />
                            <span>{data.personal_info.location}</span>
                        </div>
                    )}
                    {data.personal_info?.linkedin && (
                        <a 
                            target="_blank" 
                            rel="noreferrer" 
                            href={data.personal_info?.linkedin} 
                            className="flex items-center gap-1.5 hover:underline"
                        >
                            <Linkedin className="size-4 shrink-0" />
                            <span className="text-xs">LinkedIn</span>
                        </a>
                    )}
                    {data.personal_info?.website && (
                        <a 
                            target="_blank" 
                            rel="noreferrer" 
                            href={data.personal_info?.website} 
                            className="flex items-center gap-1.5 hover:underline"
                        >
                            <Globe className="size-4 shrink-0" />
                            <span className="text-xs">Portfolio</span>
                        </a>
                    )}
                </div>
            </header>

            {/* BODY - Reduced top/bottom padding from p-8 to py-6 (keeps px-8) */}
            <div className="px-8 py-6">
                
                {/* PROFESSIONAL SUMMARY */}
                {data.professional_summary && (
                    <section className="mb-5">
                        <h2 className="text-sm font-bold mb-2 uppercase tracking-widest border-b-2 pb-0.5" style={{ borderColor: accentColor, color: accentColor }}>
                            Professional Summary
                        </h2>
                        <p className="text-sm text-gray-700 leading-relaxed text-justify">
                            {data.professional_summary}
                        </p>
                    </section>
                )}

                {/* EXPERIENCE SECTION */}
                {data.experience && data.experience.length > 0 && (
                    <section className="mb-5">
                        <h2 className="text-sm font-bold mb-3 uppercase tracking-widest border-b-2 pb-0.5" style={{ borderColor: accentColor, color: accentColor }}>
                            Experience
                        </h2>

                        <div className="space-y-4">
                            {data.experience.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="text-base font-bold text-gray-900 uppercase">
                                            {exp.position || exp.title}
                                        </h3>
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                                            {formatDate(exp.startDate || exp.start_date)} — {exp.is_current ? "Present" : formatDate(exp.endDate || exp.end_date)}
                                        </span>
                                    </div>
                                    
                                    <div className="text-sm font-semibold mb-1" style={{ color: accentColor }}>
                                        {exp.company}
                                    </div>

                                    <ul className="list-disc ml-4 space-y-0.5 marker:text-gray-400">
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
                        <h2 className="text-sm font-bold mb-3 uppercase tracking-widest border-b-2 pb-0.5" style={{ borderColor: accentColor, color: accentColor }}>
                            Key Projects
                        </h2>

                        <div className="grid grid-cols-1 gap-3">
                            {data.project.map((p, index) => (
                                <div key={index} className="pl-3 border-l-2" style={{ borderColor: `${accentColor}40` }}>
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase">{p.name}</h3>
                                    </div>
                                    <ul className="list-disc ml-4 space-y-0.5 marker:text-gray-400">
                                        {renderBullets(p.description)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* BOTTOM GRID: EDUCATION & SKILLS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4" style={{ borderColor: `${accentColor}20` }}>
                    
                    {/* EDUCATION */}
                    {hasEducation && (
                        <section>
                            <h2 className="text-sm font-bold mb-2 uppercase tracking-widest" style={{ color: accentColor }}>
                                Education
                            </h2>
                            <div className="space-y-3">
                                {data.education.map((edu, index) => edu.institution && (
                                    <div key={index}>
                                        <h3 className="font-bold text-sm text-gray-900">
                                            {edu.degree} {edu.field && `in ${edu.field}`}
                                        </h3>
                                        <p className="text-sm font-medium text-gray-600">{edu.institution}</p>
                                        <div className="flex justify-between items-center mt-0.5 text-xs text-gray-500">
                                            <span>{formatDate(edu.graduationDate || edu.graduation_date)}</span>
                                            {edu.gpa && <span className="font-semibold">GPA: {edu.gpa}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* SKILLS */}
                    {data.skills && data.skills.length > 0 && (
                        <section>
                            <h2 className="text-sm font-bold mb-2 uppercase tracking-widest" style={{ color: accentColor }}>
                                Technical Skills
                            </h2>
                            <div className="flex flex-wrap gap-1.5">
                                {data.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-2.5 py-1 text-xs font-bold text-white rounded shadow-sm"
                                        style={{ backgroundColor: accentColor }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

            </div>
        </div>
    );
}

export default ModernTemplate;