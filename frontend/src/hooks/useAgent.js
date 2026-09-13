import { API_BASE_URL } from '../lib/api';

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
    ],
  };
}

export function useAgent() {
  async function generateQuests(goal) {
    const token = localStorage.getItem('sb-dfaycgkamjildcwmnhpg-auth-token');
    let parsedToken = "";
    if (token) {
      try {
        const parsed = JSON.parse(token);
        parsedToken = parsed.access_token;
      } catch (e) {
        console.error(e);
      }
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${parsedToken}`
        },
        signal: controller.signal,
        body: JSON.stringify({ prompt: goal }),
      });

      if (!response.ok) {
        throw new Error(`Server request failed with ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.warn("AI GENERATION FALLBACK:", error);
      return fallbackQuests(
        goal,
        "AI model is currently busy. Safe starter quests were created."
      );
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return {
    generateQuests,
    model: "Gemini 2.5 Flash",
    endpoint: `${API_BASE_URL}/api/ai/generate`,
  };
}
