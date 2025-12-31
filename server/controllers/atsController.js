import { geminiModel } from "../configs/ai.js";

export const analyzeResumeATS = async (req, res) => {
  try {
    const { resumeText, jobDescription, experienceData } = req.body;

    // 1. Validation
    if (!resumeText || resumeText.length < 50) {
      return res.status(400).json({ 
        message: "Resume content is too short. Please ensure text extraction was successful." 
      });
    }

    // 2. Context Preparation
    const experienceContext = experienceData 
      ? JSON.stringify(experienceData.map(e => ({ 
          role: e.position, 
          company: e.company, 
          text: e.description 
        }))) 
      : "No structured experience provided";

    // 3. The Strict "Rubric" Prompt (Fixes Score Fluctuation)
    const prompt = `
      You are a strict ATS Algorithm. You do not guess. You calculate scores based on evidence.
      
      **CONTEXT:** The input text below is a structured dump of a candidate's database profile. 
      - If you see data under "[CONTACT INFO]" (like email, phone, linkedin), you MUST award full points for Contact.
      - If you see data under "[EDUCATION]", you MUST award full points for Education.
      
      **SCORING RUBRIC (TOTAL 100 PTS):**
      - **Contact (10 pts):** 10 if Email AND Phone are present. 0 if missing.
      - **Summary (10 pts):** 10 if Summary section exists. 0 if missing.
      - **Education (15 pts):** 15 if Education section exists. 0 if missing.
      - **Skills (15 pts):** 15 if [SKILLS] section exists and has > 5 items.
      - **Experience Structure (20 pts):** 20 if [EXPERIENCE] exists.
      - **Content/Impact (15 pts):** 15 if descriptions contain metrics (%, $, numbers) or action verbs.
      - **Tailoring (15 pts):** 15 if skills match the Job Description: "${jobDescription || "Software Engineer"}".

      **INPUT DATA:**
      - RESUME DUMP: 
      """
      ${resumeText.substring(0, 15000).replace(/"/g, "'")}
      """
      - EXPERIENCE BLOCKS: ${experienceContext}

      **OUTPUT REQUIREMENTS:**
      Return ONLY a raw JSON object. Follow this schema exactly:
      {
        "score": <calculated_sum_of_rubric_points>,
        "metrics": {
          "content": { "score": <0-100>, "wrong": "<critique on verbs/impact>", "fix": "<actionable fix>" },
          "sections": { "score": <0-100>, "wrong": "<critique on missing sections>", "fix": "<actionable fix>" },
          "contact": { "score": <0-100>, "wrong": "<critique on contact info>", "fix": "<actionable fix>" },
          "tailoring": { "score": <0-100>, "wrong": "<critique on keywords>", "fix": "<actionable fix>" }
        },
        "keywordGaps": ["<missing_skill_1>", "<missing_skill_2>", "<missing_skill_3>"],
        "optimizedData": { 
           "professional_summary": "<Rewritten strong summary>",
           "skills": ["<Optimized Skill List>"],
           "experience": [
              { "description": "<Rewritten bullet points using 'Achieved [X] by doing [Y]' format>" },
              { "description": "<Rewritten bullet points...>" }
           ]
        }
      }
    `;

    // 4. Call Gemini AI with STRICT CONFIGURATION
    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.0,       // <--- CRITICAL: Removes randomness (91 vs 40 issue)
        responseMimeType: "application/json" // <--- CRITICAL: Ensures valid JSON response
      }
    });

    const responseText = result.response.text();

    // 5. Parse JSON (MimeType ensures it's JSON, but safe parsing is good practice)
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("AI JSON Parse Failed:", responseText);
      // Fallback cleanup if native JSON mode fails (rare)
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // 6. Return Data
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("ATS CONTROLLER ERROR:", error);
    
    if (error.message?.includes("429") || error.status === 429) {
      return res.status(429).json({ message: "AI traffic is high. Please wait 30 seconds." });
    }
    
    return res.status(500).json({ message: "Internal server error during analysis." });
  }
};