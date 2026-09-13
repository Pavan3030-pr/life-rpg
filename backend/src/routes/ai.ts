import { Router, Request, Response, NextFunction } from "express";
import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();
const FALLBACK_XP_AWARDED = 25;

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

type GeneratedQuest = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "epic";
  attribute: "strength" | "intellect" | "discipline" | "vitality";
  xpReward: number;
  goldReward: number;
};

function fallbackQuests(goal: string, reason?: string) {
  const cleanGoal = goal.trim().replace(/\s+/g, " ") || "build momentum";
  return {
    success: true,
    fallback: true,
    xpAwarded: FALLBACK_XP_AWARDED,
    message: reason || "Quest Master starter quests are ready.",
    quests: [
      {
        title: "Scout the Objective",
        description: `Spend 15 focused minutes breaking down: ${cleanGoal}.`,
        difficulty: "easy",
        attribute: "intellect",
        xpReward: 25,
        goldReward: 5,
      },
      {
        title: "First Strike",
        description: "Complete one visible action that moves the goal forward today.",
        difficulty: "medium",
        attribute: "discipline",
        xpReward: 50,
        goldReward: 10,
      },
      {
        title: "Proof of Progress",
        description: "Write a short log of what changed and what the next move is.",
        difficulty: "easy",
        attribute: "vitality",
        xpReward: 25,
        goldReward: 5,
      },
    ] satisfies GeneratedQuest[],
  };
}

function buildPrompt(goal: string) {
  return `You are the Quest Master for Life RPG. Player goal: "${goal}"
Generate exactly 3 practical real-world quests. Return ONLY valid JSON matching this schema:
{
  "success": true,
  "xpAwarded": 25,
  "quests": [
    { "title": "string", "description": "string", "difficulty": "easy", "attribute": "discipline", "xpReward": 50, "goldReward": 10 }
  ]
}`;
}

function extractJson(text: string) {
  const cleanText = text.trim();
  const fenced = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : cleanText;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(candidate.slice(start, end + 1));
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }
    
    // Explicitly target the index token string value instead of passing the array object reference
    const parts = header.split(" ");
    const tokenString = parts[1];
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(tokenString);
    if (error || !user) {
      return res.status(401).json({ message: "Invalid token trace" });
    }
    
    res.locals.userId = user.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Auth failed" });
  }
}

router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Missing prompt" });

    if (!apiKey) {
      return res.json(fallbackQuests(prompt, "Gemini key missing on system initialization configurations."));
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(prompt),
    });

    const data = extractJson(response.text || "{}");
    return res.json({ success: true, quests: data.quests || [] });
  } catch (error) {
    console.error(error);
    return res.json(fallbackQuests(req.body.prompt || "", "AI generation error"));
  }
});

export default router;
