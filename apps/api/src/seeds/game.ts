import { BadgeCategory } from "@prisma/client";

export interface InitialBadgeSeed {
  badgeId: string;
  title: string;
  name: string;
  description: string;
  category: BadgeCategory;
  icon: string;
  spriteUrl: string | null;
  color: string;
  unlockCondition: string;
  xpReward: number;
  confidenceFactor: number;
  isActive: boolean;
}

export const defaultGameConfig = {
  key: "default",
  baseXP: 10,
  xpMultiplier: 1.5,
  streakBonusPercentage: 10,
  accuracyThreshold: 70,
  levelUpXpBase: 100,
  maxLevelCap: 50,
};
