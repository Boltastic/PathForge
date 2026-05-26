import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini SDK setup
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Robust JSON extractor and parser to prevent SyntaxError from wrapping/trailing characters
function parseJsonSafe(text: string): any {
  let cleaned = text.trim();
  
  // Cut any leading/trailing markdown code block ticks if present
  if (cleaned.startsWith("```")) {
    const firstNewline = cleaned.indexOf("\n");
    if (firstNewline !== -1) {
      cleaned = cleaned.substring(firstNewline + 1);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();
  }
  
  // Ensure we locate the actual JSON block starting with { or [
  const startBrace = cleaned.indexOf("{");
  const startBracket = cleaned.indexOf("[");
  let startIdx = -1;
  if (startBrace !== -1 && startBracket !== -1) {
    startIdx = Math.min(startBrace, startBracket);
  } else {
    startIdx = startBrace !== -1 ? startBrace : startBracket;
  }
  
  if (startIdx !== -1) {
    cleaned = cleaned.substring(startIdx);
    
    // find matching closing character
    const endBrace = cleaned.lastIndexOf("}");
    const endBracket = cleaned.lastIndexOf("]");
    let endIdx = -1;
    if (endBrace !== -1 && endBracket !== -1) {
      endIdx = Math.max(endBrace, endBracket);
    } else {
      endIdx = endBrace !== -1 ? endBrace : endBracket;
    }
    
    if (endIdx !== -1) {
      cleaned = cleaned.substring(0, endIdx + 1);
    }
  }

  return JSON.parse(cleaned);
}

// 1. AI Career Matcher Route
app.post("/api/career/match", async (req, res) => {
  try {
    const {
      interests,
      skills,
      hobbies,
      education,
      salaryGoal,
      country,
      workStyle,
      lifestyle,
      realisticMode,
    } = req.body;

    const googleAi = getGeminiClient();
    if (!googleAi) {
      return res.status(400).json({
        error:
          "Gemini API key is not configured. Please add GEMINI_API_KEY to your settings.",
      });
    }

    const realisticPrompt = realisticMode
      ? `REALISTIC MODE IS TRIGGERED. You MUST be brutally realistic about these career paths. Highlight: High market saturation, fierce competition, salary limits, and intense learning difficulty. Do not sugarcoat. Be direct.`
      : `Provide an encouraging, positive, and inspiring analysis. Focus on growth, opportunities, and how easily they can integrate.`;

    const systemPrompt = `You are PathForge's elite Career Analyst. Analyse the user's profile and recommend 3-4 highly tailored, diverse career goals.
Provide the response as an organized, exact JSON structure without markdown formatting or other wrappers outside of raw JSON.
The requested fields are strictly formatted. Do NOT return as Markdown code block, just render plain text JSON.

User Profile:
- Interests: ${interests || "None specified"}
- Skills: ${skills || "None specified"}
- Hobbies: ${hobbies || "None specified"}
- Education: ${education || "None specified"}
- Salary Goal: ${salaryGoal || "None specified"}
- Preferred Country/Region: ${country || "Global"}
- Preferred Work Style: ${workStyle || "Flexible"}
- Dream Lifestyle: ${lifestyle || "Balanced"}

${realisticPrompt}

Return a valid JSON matching this schema:
{
  "generalSummary": "A 2-3 sentence overview of their traits and what kind of roles fit them.",
  "careerMatches": [
    {
      "title": "Exact Title of Career",
      "category": "e.g., Creative, Engineering, Science, Management",
      "compatibilityScore": 85, // number from 25 to 100
      "salaries": {
        "entry": 60000, // number in USD or equivalent
        "mid": 100000,
        "senior": 150000
      },
      "growthOutlook": "e.g., Explosive / High / Stable / Saturing",
      "description": "Short summary of daily tasks.",
      "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "whyFits": "Tailored explanation matching their hobby or interest.",
      "aiImpact": {
        "riskScore": 40, // 0 to 100 representing replacement risk
        "explanation": "Why AI is a supporter or threat to this career path.",
        "stabilityScore": 80 // 0 to 100
      },
      "stressScore": 50, // 0 to 100
      "wlbScore": 85, // 0 to 100
      "lifestyleFit": "How this coordinates with: " + lifestyle
    }
  ]
}`;

    const response = await googleAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            generalSummary: { type: Type.STRING },
            careerMatches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  compatibilityScore: { type: Type.INTEGER },
                  salaries: {
                    type: Type.OBJECT,
                    properties: {
                      entry: { type: Type.INTEGER },
                      mid: { type: Type.INTEGER },
                      senior: { type: Type.INTEGER }
                    },
                    required: ["entry", "mid", "senior"]
                  },
                  growthOutlook: { type: Type.STRING },
                  description: { type: Type.STRING },
                  requiredSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  whyFits: { type: Type.STRING },
                  aiImpact: {
                    type: Type.OBJECT,
                    properties: {
                      riskScore: { type: Type.INTEGER },
                      explanation: { type: Type.STRING },
                      stabilityScore: { type: Type.INTEGER }
                    },
                    required: ["riskScore", "explanation", "stabilityScore"]
                  },
                  stressScore: { type: Type.INTEGER },
                  wlbScore: { type: Type.INTEGER },
                  lifestyleFit: { type: Type.STRING }
                },
                required: [
                  "title",
                  "category",
                  "compatibilityScore",
                  "salaries",
                  "growthOutlook",
                  "description",
                  "requiredSkills",
                  "whyFits",
                  "aiImpact",
                  "stressScore",
                  "wlbScore",
                  "lifestyleFit"
                ]
              }
            }
          },
          required: ["generalSummary", "careerMatches"]
        }
      },
    });

    const text = response.text || "{}";
    const data = parseJsonSafe(text);
    res.json(data);
  } catch (err: any) {
    console.error("Career Matching Error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze career matches." });
  }
});

// 2. Career Roadmap Route
app.post("/api/career/roadmap", async (req, res) => {
  try {
    const { careerTitle, userProfile, realisticMode } = req.body;

    const googleAi = getGeminiClient();
    if (!googleAi) {
      return res.status(400).json({
        error: "Gemini API key is not configured.",
      });
    }

    const realisticPrompt = realisticMode
      ? `BE BRUTALLY HONEST. In the phases, mention the real struggle, intense grind, rejection rates, portfolio size needed, and difficulty. Keep it realistic.`
      : `Provide a clear, positive milestones plan.`;

    const systemPrompt = `You are PathForge's senior Curriculum Designer. Generate an interactive career development roadmap and career branches for the career: "${careerTitle}".
Reference the user's profile (Skills: "${userProfile?.skills || "N/A"}", Interests: "${userProfile?.interests || "N/A"}").
${realisticPrompt}

Return exactly as plain text JSON matching this schema:
{
  "careerTitle": "${careerTitle}",
  "timeline": "6 months", // Total timeline estimate
  "phases": [
    {
      "phaseName": "Phase 1: Foundation",
      "duration": "1-2 Months",
      "skillsToLearn": ["Skill A", "Skill B"],
      "projects": [
        {
          "name": "E.g., Local Weather App",
          "description": "Detailed prompt for what to build, including core logic."
        }
      ],
      "certificationsRecommended": ["E.g., AWS Cloud Practitioner"]
    }
  ],
  "branchingPaths": [
    {
      "pathName": "Junior role or entry checkpoint",
      "description": "Salary details, typical entry barriers."
    },
    {
      "pathName": "Specialization Route A",
      "description": "Routing to security, architecture, or management."
    },
    {
      "pathName": "Specialization Route B",
      "description": "Alternative specialized path."
    }
  ]
}`;

    const response = await googleAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            careerTitle: { type: Type.STRING },
            timeline: { type: Type.STRING },
            phases: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseName: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  skillsToLearn: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["name", "description"]
                    }
                  },
                  certificationsRecommended: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: [
                  "phaseName",
                  "duration",
                  "skillsToLearn",
                  "projects",
                  "certificationsRecommended"
                ]
              }
            },
            branchingPaths: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pathName: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["pathName", "description"]
              }
            }
          },
          required: ["careerTitle", "timeline", "phases", "branchingPaths"]
        }
      },
    });

    const text = response.text || "{}";
    const data = parseJsonSafe(text);
    res.json(data);
  } catch (err: any) {
    console.error("Roadmap Generation Error:", err);
    res.status(500).json({ error: err.message || "Failed to generate roadmap." });
  }
});

// 3. Skill Gap Analyzer Route
app.post("/api/career/gap-analyze", async (req, res) => {
  try {
    const { targetCareer, textToAnalyze, profileSkills } = req.body;

    const googleAi = getGeminiClient();
    if (!googleAi) {
      return res.status(400).json({
        error: "Gemini API key is not configured.",
      });
    }

    const systemPrompt = `You are PathForge's Skill Gap Auditor.
Compare the user's current credentials/profile against what is expected for a successful career as: "${targetCareer}".
Analyze this credential text: "${textToAnalyze || "None provided"}".
And their existing skills list: "${profileSkills ? profileSkills.join(", ") : "None provided"}".

Return exactly as plain text JSON:
{
  "gapScore": 65, // out of 100 matching score
  "missingSkills": ["Critical Skill A", "Key Skill B", "Desirable Domain C"],
  "recommendations": [
    {
      "skillName": "Critical Skill A",
      "actionItem": "Build a multi-page app incorporating this concept.",
      "resources": ["Coursera Web Development Masterclass", "Official Docs Tutorial"]
    }
  ],
  "feedback": "A concise paragraph (2-3 sentences) detailing their positioning, weak fields, and an encouraging overview of what needs primary focus."
}`;

    const response = await googleAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gapScore: { type: Type.INTEGER },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skillName: { type: Type.STRING },
                  actionItem: { type: Type.STRING },
                  resources: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["skillName", "actionItem", "resources"]
              }
            },
            feedback: { type: Type.STRING }
          },
          required: ["gapScore", "missingSkills", "recommendations", "feedback"]
        }
      },
    });

    const text = response.text || "{}";
    const data = parseJsonSafe(text);
    res.json(data);
  } catch (err: any) {
    console.error("Skill Gap Analysis Error:", err);
    res.status(500).json({ error: err.message || "Failed to analyze skill gaps." });
  }
});

// 4. AI Mentor Chat Stream (SSE)
app.post("/api/mentor/chat-stream", async (req, res) => {
  const { messages, realisticMode, careerContext } = req.body;

  try {
    const googleAi = getGeminiClient();
    if (!googleAi) {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      res.write(`data: ${JSON.stringify({ text: "Error: Gemini API Key is not set up in settings. Feel free to chat, but please set your API key to interact with real models!" })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    let promptLines = [];
    promptLines.push("You are an expert career mentor at PathForge. Match the style requested:");
    if (realisticMode) {
      promptLines.push("CRITICAL ROLE: You are IN BRUTALLY REALISTIC MODE. Be completely direct, hardline, and blunt. Point out competition, saturated markets, actual work stress, student debt, salary cuts, and difficult skill hurdles. Do not use soft words. Maintain a tough but insightful mentor persona.");
    } else {
      promptLines.push("Role: Be professional, positive, encouraging, and deeply motivational. Provide highly actionable tips to help them feel confident, capable, and excited.");
    }

    if (careerContext) {
      promptLines.push(`Current career focal point: ${JSON.stringify(careerContext)}`);
    }

    promptLines.push("Use clear, elegant markdown. Bold important points. Provide small bullet points instead of endless walls of text.");
    promptLines.push("Current Conversation:");

    for (const msg of messages) {
      const pRole = msg.role === "user" ? "User" : "Mentor";
      promptLines.push(`${pRole}: ${msg.content}`);
    }
    promptLines.push("Mentor:");

    const stream = await googleAi.models.generateContentStream({
      model: "gemini-3.5-flash",
      contents: promptLines.join("\n\n"),
    });

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("SSE Chat Error:", err);
    // Return standard SSE error
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });
    res.write(`data: ${JSON.stringify({ error: err.message || "Failed to stream mentoring." })}\n\n`);
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

// Mock/Default API fallback indicators
app.get("/api/config", (req, res) => {
  res.json({
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appUrl: process.env.APP_URL || "",
  });
});

// Vite dev server mounting or Production static files serving
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for unknown routes (SPA mapping)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PathForge Server running at http://0.0.0.0:${PORT}`);
  });
}

initializeServer();
