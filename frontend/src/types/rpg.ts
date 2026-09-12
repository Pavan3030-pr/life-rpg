export type Attribute = "strength" | "intellect" | "discipline" | "vitality";

export type QuestDifficulty = "easy" | "medium" | "hard" | "epic";

export type QuestStatus = "active" | "completed" | "archived";

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  gold: number;
  streak: number;
  strength: number;
  intellect: number;
  discipline: number;
  vitality: number;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  difficulty: QuestDifficulty;
  attribute: Attribute;
  xpReward: number;
  goldReward: number;
  status: QuestStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  owned: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}
