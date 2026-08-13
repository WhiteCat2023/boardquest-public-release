export type BadgeType = "bronze" | "silver" | "gold" | "fire" | "lightning" | "crown" | "diamond";

export type BadgeCategory = 
  | "Progression" 
  | "Excellence" 
  | "Consistency" 
  | "Precision" 
  | "Subject Mastery" 
  | "Dedication" 
  | "Elite Status";

export interface GameBadge {
  id: string;
  title: string;
  badgeType: BadgeType;
  category: BadgeCategory;
  description: string;
  xp: number;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isActive: boolean;
  unlockedCount?: number;
  triggerRule: {
    type: "accuracy" | "streak" | "level" | "score" | "mastery" | "xp";
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
