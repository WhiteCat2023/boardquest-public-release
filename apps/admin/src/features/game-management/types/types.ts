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
  | "Progression" 
  | "Excellence" 
  | "Consistency" 
  | "Precision" 
  | "Subject Mastery" 
  | "Dedication" 
  | "Elite Status"
  | "Speed & Agility"
  | "Special Quest";

export interface GameBadge {
  id: string;
  title: string;
  badgeType: BadgeType;
  category: BadgeCategory;
  description: string;
  xp: number;
  iconName: string;
  imageUrl?: string; // Cloudinary uploaded photo URL
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor?: string;
  isActive: boolean;
  unlockedCount?: number;
  triggerRule: {
    type: "accuracy" | "streak" | "level" | "score" | "mastery" | "xp" | "questions";
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
