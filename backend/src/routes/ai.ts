import { Router, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();

async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing authentication token.",
      });
    }

    const token = header.replace("Bearer ", "").trim();

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    res.locals.userId = user.id;
    next();
  } catch {
    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
}

router.post("/generate-quests", requireAuth, async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal || typeof goal !== "string") {
      return res.status(400).json({
        message: "Goal is required.",
      });
    }

    const cleanGoal = goal.trim();

    if (cleanGoal.length < 3) {
      return res.status(400).json({
        message: "Goal is too short.",
      });
    }

    if (cleanGoal.length > 200) {
      return res.status(400).json({
        message: "Goal must be 200 characters or less.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        message: "Gemini API key is not configured.",
      });
    }

    const prompt = `
You are the quest master for a Life RPG productivity game.

The player wants to achieve:
"${cleanGoal}"

Generate exactly 3 practical real-world quests that help the player achieve this goal.

Return ONLY valid JSON in this exact format:
{
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
- Exactly 3 quests.
- difficulty must be one of: easy, medium, hard, epic.
- attribute must be one of: strength, intellect, discipline, vitality.
- xpReward must be one of: 25, 50, 75, 100, 150.
- goldReward must be one of: 5, 10, 15, 20, 30.
- Quests must be realistic and actionable.
- Do not invent impossible tasks.
- Keep titles under 60 characters.
- Keep descriptions under 160 characters.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("GEMINI ERROR:", errorText);

      return res.status(502).json({
        message: "AI quest generation failed.",
      });
    }

    const data = await response.json();

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return res.status(502).json({
        message: "AI returned no quests.",
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(generatedText);
    } catch {
      return res.status(502).json({
        message: "AI returned invalid quest data.",
      });
    }

    if (!Array.isArray(parsed.quests) || parsed.quests.length !== 3) {
      return res.status(502).json({
        message: "AI returned an invalid number of quests.",
      });
    }

    return res.json({
      success: true,
      quests: parsed.quests,
    });
  } catch (error) {
    console.error("AI QUEST ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate quests.",
    });
  }
});

export default router;
