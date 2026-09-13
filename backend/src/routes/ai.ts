import { Router, Request, Response, NextFunction } from "express";
import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();
const FALLBACK_XP_AWARDED = 25;

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: apiKey });

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
Generate exactly 3 practical real-world quests. Return ONLY a valid JSON object matching this schema structure without markdown fencing:
{
  "success": true,
  "xpAwarded": 25,
  "quests": [
    { "title": "string", "description": "string", "difficulty": "easy", "attribute": "discipline", "xpReward": 50, "goldReward": 10 }
  ]
}`;
}

function extractJson(text: string) {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  }
  const start = cleanText.indexOf("{");
  const end = cleanText.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON boundaries found");
  return JSON.parse(cleanText.slice(start, end + 1));
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }
    const tokenString = header.substring(7).trim();
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
  const { prompt } = req.body;
  const targetGoal = prompt || "";

  try {
    if (!targetGoal) return res.status(400).json({ message: "Missing prompt" });
    if (!apiKey) return res.json(fallbackQuests(targetGoal, "Gemini key missing."));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(targetGoal),
    });

    const rawText = response.text || "";
    const data = extractJson(rawText);
    return res.json({ success: true, quests: data.quests || [] });
  } catch (error) {
    console.error("GENERATION ERROR:", error);
    return res.json(fallbackQuests(targetGoal, "AI processing loop failed."));
  }
});

export default router;
