import { geminiModel } from "../configs/ai.js";

export const analyzeResumeATS = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    if (!resumeText) return res.status(400).json({ message: "Resume content is missing" });

    const prompt = `
      You are an expert ATS auditor. Analyze this resume against industry standards.
      Resume Content: ${resumeText}
      Job Description: ${jobDescription || "Generic technical role"}

      Return ONLY valid JSON:
      {
        "score": number,
        "metrics": {
          "content": { "score": number, "wrong": "string", "fix": "string" },
          "sections": { "score": number, "wrong": "string", "fix": "string" },
          "contact": { "score": number, "wrong": "string", "fix": "string" },
          "tailoring": { "score": number, "wrong": "string", "fix": "string" }
        },
        "keywordGaps": [{"skill": "string"}],
        "optimizedData": { 
           "professional_summary": "string",
           "skills": ["string"],
           "experience": [{"company": "string", "position": "string", "description": "string"}]
        }
      }
    `;

    const result = await geminiModel.generateContent(prompt);
    
    if (!result?.response) {
      console.error(" Gemini Error: No response object");
      return res.status(500).json({ message: "AI Service failed" });
    }

    const responseText = result.response.text();
    
    // REGEX: Clip only the JSON block to avoid 500 errors from AI "chatter"
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(" AI Response was not JSON:", responseText);
      return res.status(500).json({ message: "AI failed to generate report" });
    }

    const parsedData = JSON.parse(jsonMatch[0]);
    return res.json(parsedData);

  } catch (error) {
    if (error.status === 429 || error.message?.includes("429")) {
      return res.status(429).json({ message: "AI limit reached. Wait 60s." });
    }
    console.error(" ATS SYSTEM ERROR:", error);
    res.status(500).json({ message: "Internal server error during analysis" });
  }
};