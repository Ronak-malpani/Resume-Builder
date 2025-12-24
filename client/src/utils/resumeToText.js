export const resumeToText = (resume) => {
  if (!resume) return "";

  return `
${resume.personal_info?.full_name || ""}
${resume.personal_info?.email || ""} | ${resume.personal_info?.phone || ""} | ${resume.personal_info?.location || ""}

PROFESSIONAL SUMMARY
${resume.professional_summary || ""}

WORK EXPERIENCE
${(resume.experience || []).map(exp => `
${exp.position || ""}
${exp.company || ""}
${exp.start_date || ""} - ${exp.is_current ? "Present" : exp.end_date || ""}
${exp.description || ""}
`).join("\n")}

PROJECTS
${(resume.project || []).map(p => `
${p.name || ""}
${p.description || ""}
`).join("\n")}

EDUCATION
${(resume.education || []).map(e => `
${e.degree || ""} - ${e.institution || ""}
Graduated: ${e.graduation_date || ""}
`).join("\n")}

SKILLS
${(resume.skills || []).join(", ")}
`;
};
