export type BadgeType =
  | "bronze"
  | "silver"
  | "gold"
  | "fire"
  | "lightning"
  | "crown"
  | "diamond"
  | "emerald"
  | "ruby"
  | "cosmic";

export type BadgeCategory =
  | "QUEST"
  | "STREAK"
  | "BOSS"
  | "SUBJECT"
  | "EXAM";

export interface GameBadge {
  id: string;
  badgeId: string; // Slug identifier (e.g., 'gold', 'silver', 'speed')
  title: string; // e.g. 'Master', 'Adept', 'Swift Solver'
  name: string; // e.g. 'Gold Quest Badge', 'Silver Quest Badge'
  description: string;
  category: BadgeCategory; // 'QUEST' | 'STREAK' | 'BOSS' | 'SUBJECT' | 'EXAM'
  icon: string; // 'trophy', 'flame', 'zap', 'shield', 'crown', etc.
  spriteUrl?: string | null; // Cloudinary or sprite image URL
  color: string; // Hex color code ('#FFD700', etc.)
  unlockCondition: string; // Unlock condition description
  xpReward: number; // XP rewarded on unlock
  confidenceFactor?: number; // Multiplier factor (default: 1.0)
  isActive: boolean;
  unlockedCount?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  // UI display helpers & backwards-compatibility aliases
  xp?: number;
  iconName?: string;
  imageUrl?: string | null;
  badgeType?: string;
  bgColor?: string;
  borderColor?: string;
  glowColor?: string;
  triggerRule?: {
    type: string;
    threshold: number;
  };
}

export interface GameConfigSettings {
  baseXP: number;
  xpMultiplier: number;
  streakBonusPercentage: number;
  accuracyThreshold: number;
  levelUpXpBase: number;
  maxLevelCap: number;
}
