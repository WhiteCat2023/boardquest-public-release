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

export const initialBadges: InitialBadgeSeed[] = [
  {
    badgeId: "gold",
    title: "Master",
    name: "Gold Quest Badge",
    description: "Achieved 100% accuracy in diagnostic evaluations and quest arena.",
    category: "QUEST",
    icon: "trophy",
    spriteUrl: null,
    color: "#FFD700",
    unlockCondition: "100% accuracy in Quest Arena",
    xpReward: 200,
    confidenceFactor: 1.5,
    isActive: true,
  },
  {
    badgeId: "silver",
    title: "Adept",
    name: "Silver Quest Badge",
    description: "Achieved >=85% accuracy in subject evaluation tests.",
    category: "QUEST",
    icon: "award",
    spriteUrl: null,
    color: "#C0C0C0",
    unlockCondition: ">=85% accuracy in evaluation tests",
    xpReward: 150,
    confidenceFactor: 1.2,
    isActive: true,
  },
  {
    badgeId: "bronze",
    title: "Aspirant",
    name: "Bronze Quest Badge",
    description: "Completed initial evaluation quest challenge.",
    category: "QUEST",
    icon: "medal",
    spriteUrl: null,
    color: "#CD7F32",
    unlockCondition: "Complete first evaluation quest",
    xpReward: 100,
    confidenceFactor: 1.0,
    isActive: true,
  },
  {
    badgeId: "streak-7",
    title: "Unstoppable",
    name: "7-Day Streak Badge",
    description: "Maintained a 7-day continuous study and quest streak.",
    category: "STREAK",
    icon: "flame",
    spriteUrl: null,
    color: "#FF5722",
    unlockCondition: "Maintain a 7-day active streak",
    xpReward: 300,
    confidenceFactor: 1.3,
    isActive: true,
  },
  {
    badgeId: "speed",
    title: "Swift Solver",
    name: "Speed Master Badge",
    description: "Answered questions rapidly with high precision.",
    category: "EXAM",
    icon: "zap",
    spriteUrl: null,
    color: "#00E5FF",
    unlockCondition: "Answer with average time < 15s with >=90% accuracy",
    xpReward: 250,
    confidenceFactor: 1.4,
    isActive: true,
  },
  {
    badgeId: "boss-slayer",
    title: "Boss Slayer",
    name: "Subject Master Badge",
    description: "Conquered major subject board examination simulator.",
    category: "BOSS",
    icon: "crown",
    spriteUrl: null,
    color: "#9C27B0",
    unlockCondition: "Complete comprehensive subject mock exam",
    xpReward: 500,
    confidenceFactor: 2.0,
    isActive: true,
  },
];

export const defaultGameConfig = {
  key: "default",
  baseXP: 10,
  xpMultiplier: 1.5,
  streakBonusPercentage: 10,
  accuracyThreshold: 70,
  levelUpXpBase: 100,
  maxLevelCap: 50,
};
