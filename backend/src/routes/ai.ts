import { Router, Request, Response, NextFunction } from "express";
import { GoogleGenAI } from "@google/generative-ai";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();
const FALLBACK_XP_AWARDED = 25;

// Initialize Gemini SDK with your Render Environment Key
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
    message: reason || "Quest Master is warming up. Starter quests are ready.",
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
  return `You are the Quest Master for Life RPG, a productivity game.

Player goal: "${goal.trim().replace(/\s+/g, " ")}"

Generate exactly 3 practical real-world quests based on this goal.
Return ONLY a valid JSON object matching this schema structure without any markdown fencing:
{
  "success": true,
  "xpAwarded": 25,
  "quests": [
    {
      "title": "short quest title",
      "description": "clear practical description",
      "difficulty": "easy",
      "attribute": "discipline",
      "xpReward": 50,
      "goldReward": 10
    }
  ]
}

Rules:
- difficulty must strictly be: easy, medium, hard, or epic.
- attribute must strictly be: strength, intellect, discipline, or vitality.
- xpReward must strictly be: 25, 50, 75, 100, or 150.
- goldReward must strictly be: 5, 10, 15, 20, or 30.
- Titles must be under 60 characters.
- Descriptions must be under 160 characters.`;
}

function extractJson(text: string) {
  const cleanText = text.trim();
  const fenced = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || cleanText;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI returned no JSON payload.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function sanitizeQuest(quest: Partial<GeneratedQuest>, index: number) {
  const difficulties: GeneratedQuest["difficulty"][] = ["easy", "medium", "hard", "epic"];
  const attributes: GeneratedQuest["attribute"][] = ["strength", "intellect", "discipline", "vitality"];
  
  const difficulty = quest.difficulty && difficulties.includes(quest.difficulty) ? quest.difficulty : "medium";
  const attribute = quest.attribute && attributes.includes(quest.attribute) ? quest.attribute : "discipline";

  return {
    title: typeof quest.title === "string" && quest.title.trim() ? quest.title.trim().slice(0, 60) : `Quest ${index + 1}`,
    description: typeof quest.description === "string" && quest.description.trim() ? quest.description.trim().slice(0, 160) : "Take one practical step.",
    difficulty,
    attribute,
    xpReward: [25, 50, 75, 100, 150].includes(Number(quest.xpReward)) ? Number(quest.xpReward) : 50,
    goldReward: [5, 10, 15, 20, 30].includes(Number(quest.goldReward)) ? Number(quest.goldReward) : 10,
  } satisfies GeneratedQuest;
}

function sanitizeAgentResponse(parsed: any, goal: string) {
  const quests = Array.isArray(parsed?.quests) ? parsed.quests.slice(0, 3).map(sanitizeQuest) : [];

  if (quests.length !== 3) {
    return fallbackQuests(goal, "Quest Master drafted a safe starter set.");
  }

  return {
    success: true,
    fallback: false,
    xpAwarded: Number(parsed?.xpAwarded) > 0 ? Number(parsed.xpAwarded) : FALLBACK_XP_AWARDED,
    quests,
  };
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing authentication token." });
    }

    const token = header.replace("Bearer ", "").trim();
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Invalid authentication token." });
    }

    res.locals.userId = user.id;
    next();
  } catch {
    return res.status(401).json({ message: "Authentication failed." });
  }
}

router.post("/generate", requireAuth, async (req, res) => {
  let cleanGoal = "";

  try {
    const { prompt } = req.body;
    const goal = prompt;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({ message: "Goal is required." });
    }

    cleanGoal = goal.trim();
    if (cleanGoal.length < 3 || cleanGoal.length > 200) {
      return res.status(400).json({ message: "Goal must be between 3 and 200 characters." });
    }

    if (!apiKey) {
      return res.json(fallbackQuests(cleanGoal, "Gemini key is missing on backend configuration settings."));
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildPrompt(cleanGoal),
    });

    const generatedText = response.text;
    if (!generatedText) {
      return res.json(fallbackQuests(cleanGoal, "AI system returned empty responses."));
    }

    return res.json(sanitizeAgentResponse(extractJson(generatedText), cleanGoal));
  } catch (error) {
    console.error("AI GENERATION ERROR DETECTED:", error);
    return res.json(fallbackQuests(cleanGoal, "AI model encountered traffic issues. Safe starter quests ready."));
  }
});

export default router;
