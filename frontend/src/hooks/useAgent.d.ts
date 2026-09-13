export type GeneratedQuest = {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "epic";
  attribute: "strength" | "intellect" | "discipline" | "vitality";
  xpReward: number;
  goldReward: number;
};

export type AgentQuestResponse = {
  success: true;
  fallback: boolean;
  xpAwarded: number;
  message?: string;
  quests: GeneratedQuest[];
};

export function useAgent(): {
  generateQuests(goal: string): Promise<AgentQuestResponse>;
  model: string;
  endpoint: string;
};
