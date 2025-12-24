import Resume from "../models/Resume.js";
import { geminiModel } from "../configs/ai.js";

export const enhanceProfessionalSummary = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) return res.status(400).json({ message: "Missing userContent" });

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

export const enhanceJobDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) return res.status(400).json({ message: "No content provided" });

    const prompt = `
      You are an expert resume writer.
      Enhance the job description below into 3 professional bullet points.
      Rules:
      - Use strong action verbs.
      - Focus on achievements.
      - Return ONLY the bullet points, one per line.
      - Do not use markdown symbols like * or -.
      - Do not include introductory text.
      Content: ${userContent}
      `;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    const enhancedContent = responseText.replace(/```[a-z]*\n?/ig, "").replace(/```/g, "").replace(/[*#-]/g, "").trim();

    res.status(200).json({ enhancedContent });
  } catch (error) {
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      return res.status(429).json({ message: "AI quota exceeded. Please wait." });
    }
    res.status(500).json({ message: "AI Service unavailable" });
  }
};

export const enhanceProjectDescription = async (req, res) => {
  try {
    const { userContent } = req.body;
    if (!userContent) return res.status(400).json({ message: "Missing userContent" });

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
    const enhancedContent = result.response.text().replace(/\r\n/g, "\n").replace(/\n\s*\n/g, "\n").trim();

    res.status(200).json({ enhancedContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    const { title, resumeText } = req.body;
    const userId = req.userId;

    if (!title || !resumeText) {
      return res.status(400).json({ message: "Missing title or resume content" });
    }

    const prompt = `
      You are an expert resume parser. Analyze the provided raw text and extract information into the exact JSON structure defined below.
      
      CRITICAL INSTRUCTIONS FOR PERSONAL_INFO:
      1. full_name: Usually the first 1-3 words of the document. Look for name-like patterns.
      2. email: Identify strings containing '@' and domain extensions (e.g., .com, .in).
      3. phone: Look for numeric patterns like +XX, (XXX), or XXX-XXX-XXXX.
      4. links: Search specifically for "linkedin.com/in/", "github.com/", and portfolio URLs.
      5. profession: Look for job titles near the name (e.g., "Full Stack Developer").
      
      STRICT DATA RULES:
      - Education: Store GPA, CGPA, or Percentage exactly as written in the "gpa" field.
      - Skills: Extract every technology, language, and tool found into a flat array.
      - Descriptions: Reconstruct sentences from the raw text into a single cohesive string.
      - Format: Return ONLY raw JSON. No markdown, no introductory text.

      Raw Text Content:
      ${resumeText}

      JSON Schema:
      {
        "personal_info": { 
          "full_name": "string", 
          "profession": "string", 
          "email": "string", 
          "phone": "string", 
          "location": "string", 
          "linkedin": "string", 
          "github": "string", 
          "website": "string" 
        },
        "professional_summary": "string",
        "skills": ["string"],
        "experience": [{ "company": "string", "position": "string", "start_date": "string", "end_date": "string", "description": "string", "is_current": boolean }],
        "project": [{ "name": "string", "type": "string", "description": "string" }],
        "education": [{ "institution": "string", "degree": "string", "field": "string", "graduation_date": "string", "gpa": "string" }]
      }
    `;

    const result = await geminiModel.generateContent(prompt);
    const responseText = result.response.text();
    
    // Safety check to extract JSON even if AI includes markdown backticks
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to parse text into valid JSON");
    
    const parsedData = JSON.parse(jsonMatch[0]);

    // Create the resume in the Database
    const newResume = await Resume.create({
      userId,
      title,
      ...parsedData,
    });

    res.status(200).json({ resume: newResume });
  } catch (error) {
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ message: "AI limit reached. Please wait 60 seconds." });
    }
    console.error("AI Upload Error:", error);
    res.status(500).json({ message: "Failed to parse resume content" });
  }
};