import Resume from "../models/Resume.js";
import { geminiModel } from "../configs/ai.js";

const cleanAIResponse = (text) => {
  return text
    .replace(/```json/g, "") // Remove opening backticks
    .replace(/```/g, "")     // Remove closing backticks
    .trim();                 // Remove extra whitespace
};

/* ================================
   ENHANCE PROFESSIONAL SUMMARY
================================ */
export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing userContent" });
    }

    const prompt = `
You are an expert resume writer.

Enhance the professional summary below.

Rules:
- 1 to 2 sentences
- ATS-friendly
- Highlight skills, experience & career goals
- Return ONLY plain text

Summary:
${userContent}
`;

    const result = await geminiModel.generateContent(prompt);
    const enhancedContent = result.response.text().trim();

    res.status(200).json({ enhancedContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ENHANCE JOB DESCRIPTION
================================ */
/* aiController.js - Enhance Job Description */
export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "No content provided for enhancement" });
    }

    const prompt = `
      You are an expert resume writer.
      Enhance the job description below into 3 professional bullet points.
      Rules:
      - Use strong action verbs.
      - Focus on achievements.
      - Return ONLY the bullet points, one per line.
      - Do not use markdown symbols like * or -.
      - Do not include introductory text or markdown backticks.
      
      Content: ${userContent}
    `;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();

    //  CLEANUP: Remove markdown backticks, bullets, and stray hashes
    const enhancedContent = responseText
      .replace(/```[a-z]*\n?/ig, "") // Remove opening backticks
      .replace(/```/g, "")           // Remove closing backticks
      .replace(/[*#-]/g, "")         // Remove bullet symbols
      .trim();

    res.status(200).json({ enhancedContent });

  } catch (error) {
    console.error("Gemini Error:", error);

    //  FIX: Handle Quota/Rate Limit (429) gracefully for the frontend
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      return res.status(429).json({ 
        message: "AI quota exceeded. Please wait a minute before trying again." 
      });
    }

    res.status(500).json({ message: "AI Service is temporarily unavailable" });
  }
};
/* ================================
   ENHANCE PROJECT DESCRIPTION
================================ */
export const enhanceProjectDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) {
      return res.status(400).json({ message: "Missing userContent" });
    }

    const prompt = `
You are a resume expert.

STRICT RULES:
- 2 to 3 sentences
- Each sentence starts with a strong action verb
- Each sentence on a new line
- No markdown, no bullets
- Return ONLY raw text

Project:
${userContent}
`;

    const result = await geminiModel.generateContent(prompt);
    const enhancedContent = result.response
      .text()
      .replace(/\r\n/g, "\n")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    res.status(200).json({ enhancedContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   UPLOAD & PARSE RESUME (ATS)
================================ */
export const uploadResume = async (req, res) => {
  try {
    const { resumeText, title } = req.body;
    const userId = req.userId;

    if (!resumeText) {
      return res.status(400).json({ message: "Missing resumeText" });
    }

    const prompt = `
You are an AI resume parser.

STRICT RULES:
- Return ONLY valid JSON
- No explanation
- No markdown
- No extra text

JSON FORMAT:
{
  "professional_summary": "",
  "skills": [],
  "personal_info": {
    "image": "",
    "full_name": "",
    "profession": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "experience": [],
  "project": [],
  "education": []
}

Resume:
${resumeText}
`;

    const result = await geminiModel.generateContent(prompt);
    const extractedText = result.response.text().trim();

    const parsedData = JSON.parse(extractedText);

    const newResume = await Resume.create({
      userId,
      title,
      ...parsedData,
    });

    res.status(200).json({ resumeId: newResume._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
