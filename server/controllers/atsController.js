import { geminiModel } from '../configs/ai.js';

// Helper to remove any markdown formatting the AI might add
const cleanAIResponse = (text) => {
  return text
    .replace(/```json/g, "") 
    .replace(/```/g, "")     
    .trim();                 
};

export const analyzeResumeATS = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    
    // 1. Validate input
    if (!resumeText) {
      return res.status(400).json({ message: "Resume content is missing" });
    }

    // 2. Define the AI Prompt
    const prompt = `
      You are an expert ATS (Applicant Tracking System) Auditor. Analyze the Resume against the Job Description (JD).
      
      SCORING WEIGHTS: 
      - 40% Keyword Match (Presence of hard skills)
      - 30% Semantic Relevance (Alignment with role seniority/industry)
      - 20% STAR Impact (Evidence of metrics, numbers, and results)
      - 10% Formatting (Standard headers and contact info)
      
      RULES:
      1. Use the STAR (Situation, Task, Action, Result) method for all "example" content.
      2. Identify specific "redFlags" like missing links or lack of quantifiable achievements.
      3. Return ONLY a valid JSON object. No markdown backticks.

      JSON STRUCTURE:
      {
        "score": number,
        "experience": [{"title": "string","company": "string","impact": "string"}]
        "tailoring": { "overall": number, "hardSkills": number, "softSkills": number, "actionVerbs": number },
        "qualityChecks": [{ "name": "string", "status": "Good" | "Needs Work", "message": "string" }],
        "keywordGaps": [{ "skill": "string", "category": "Tech" | "Tool" | "Process" }],
        "redFlags": ["string"],
        "sections": [{ "name": "string", "userContent": "string", "example": "string" }]
      }

      RESUME CONTENT: ${resumeText}
      JOB DESCRIPTION: ${jobDescription || "Generic technical role"}
    `;

    try {
      // 3. Attempt to generate content using Gemini
      const result = await geminiModel.generateContent(prompt);
      const responseText = result.response.text();
      
      // 4. Robust JSON Extraction
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI failed to return valid JSON format");
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Send successful response with isMock: false
      return res.json({ ...parsedData, isMock: false });

    } catch (aiError) {
      // 5. HANDLE QUOTA EXCEEDED (429) - Falling back to mock data
      if (aiError.status === 429 || aiError.message?.includes("429")) {
        console.warn("Gemini Quota Hit: Falling back to smart mock data.");
        
        return res.json({
          "score": 65,
          "isMock": true, // Flag for the frontend to show "Demo Mode"
          "tailoring": { "overall": 65, "hardSkills": 50, "softSkills": 80, "actionVerbs": 65 },
          "qualityChecks": [
            { "name": "Quantifiable Metrics", "status": "Needs Work", "message": "Missing numbers/percentages in your bullet points." },
            { "name": "ATS Parsing", "status": "Good", "message": "Standard layout detected." }
          ],
          "keywordGaps": [
            { "skill": "Unit Testing", "category": "Process" },
            { "skill": "Cloud Infrastructure", "category": "Tech" },
            { "skill": "TypeScript", "category": "Tech" }
          ],
          "redFlags": [
            "Experience section lacks measurable impact (metrics)",
            "Missing professional summary or objective",
            "LinkedIn profile URL is not found"
          ],
          "sections": [
            { 
              "name": "Experience", 
              "userContent": "Worked on web apps.", 
              "example": "Spearheaded the development of 3+ React applications, improving load speeds by 20% through code-splitting." 
            }
          ]
        });
      }
      throw aiError;
    }
  } catch (error) {
    console.error("ATS Analysis Error:", error);
    res.status(500).json({ message: "Analysis failed to parse correctly." });
  }
};