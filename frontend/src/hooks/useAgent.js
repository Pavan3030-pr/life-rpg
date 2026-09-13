const OLLAMA_MODEL =
  import.meta.env.VITE_OLLAMA_MODEL || "qwen2.5-coder:7b";
const OLLAMA_HOST =
  import.meta.env.VITE_OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_GENERATE_URL = `${OLLAMA_HOST}/api/generate`;
const FALLBACK_XP_AWARDED = 25;

function normalizeGoal(goal) {
  return goal.trim().replace(/\s+/g, " ");
}

function fallbackQuests(goal, reason) {
  const cleanGoal = normalizeGoal(goal) || "build momentum";

  return {
    success: true,
    fallback: true,
    xpAwarded: FALLBACK_XP_AWARDED,
    message:
      reason ||
      "Local Quest Master is warming up. Starter quests are ready.",
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
    ],
  };
}

function extractJson(text) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Ollama returned no JSON payload.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function sanitizeQuest(quest, index) {
  const difficulties = ["easy", "medium", "hard", "epic"];
  const attributes = ["strength", "intellect", "discipline", "vitality"];

  return {
    title:
      typeof quest.title === "string" && quest.title.trim()
        ? quest.title.trim().slice(0, 60)
        : `Quest ${index + 1}`,
    description:
      typeof quest.description === "string" && quest.description.trim()
        ? quest.description.trim().slice(0, 160)
        : "Take one practical step and record the result.",
    difficulty: difficulties.includes(quest.difficulty)
      ? quest.difficulty
      : "medium",
    attribute: attributes.includes(quest.attribute)
      ? quest.attribute
      : "discipline",
    xpReward: [25, 50, 75, 100, 150].includes(Number(quest.xpReward))
      ? Number(quest.xpReward)
      : 50,
    goldReward: [5, 10, 15, 20, 30].includes(Number(quest.goldReward))
      ? Number(quest.goldReward)
      : 10,
  };
}

function sanitizeAgentResponse(parsed, goal) {
  const quests = Array.isArray(parsed.quests)
    ? parsed.quests.slice(0, 3).map(sanitizeQuest)
    : [];

  if (quests.length !== 3) {
    return fallbackQuests(goal, "Quest Master drafted a safe starter set.");
  }

  return {
    success: true,
    fallback: false,
    xpAwarded:
      Number(parsed.xpAwarded) > 0
        ? Number(parsed.xpAwarded)
        : FALLBACK_XP_AWARDED,
    quests,
  };
}

function buildPrompt(goal) {
  return `You are the Quest Master for Life RPG, a productivity game.

Player goal: "${normalizeGoal(goal)}"

Generate exactly 3 practical real-world quests.
Return ONLY valid JSON:
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
- difficulty: easy, medium, hard, or epic.
- attribute: strength, intellect, discipline, or vitality.
- xpReward: 25, 50, 75, 100, or 150.
- goldReward: 5, 10, 15, 20, or 30.
- Titles under 60 characters.
- Descriptions under 160 characters.`;
}

async function postToLocalOllama(goal) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(OLLAMA_GENERATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: buildPrompt(goal),
        stream: false,
        options: {
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed with ${response.status}.`);
    }

    const data = await response.json();
    return sanitizeAgentResponse(extractJson(data.response || ""), goal);
  } finally {
    window.clearTimeout(timeout);
  }
}

export function useAgent() {
  async function generateQuests(goal) {
    try {
      return await postToLocalOllama(goal);
    } catch (error) {
      console.warn("LOCAL OLLAMA FALLBACK:", error);
      return fallbackQuests(
        goal,
        "Local model is unavailable, so safe starter quests were created."
      );
    }
  }

  return {
    generateQuests,
    model: OLLAMA_MODEL,
    endpoint: OLLAMA_GENERATE_URL,
  };
}
