import {
  Medal,
  Trophy,
  Sparkles,
  Flame,
  Award,
  Crown,
  Zap,
  Gem,
  Target,
  ShieldCheck,
  Rocket,
  Star,
  Heart,
  Skull,
  Compass,
  BookOpen,
  Swords,
  Flag,
  Feather,
} from "lucide-react";
import type { BadgeType, BadgeCategory } from "../../types/types";

export interface BadgeTierMeta {
  type: BadgeType;
  label: string;
  badgeTag: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  gradient: string;
}

export const BADGE_TYPES: BadgeTierMeta[] = [
  {
    type: "bronze",
    label: "Bronze Tier",
    badgeTag: "🥉 BRONZE",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    gradient: "from-amber-600/20 via-amber-500/5 to-transparent",
  },
  {
    type: "silver",
    label: "Silver Tier",
    badgeTag: "🥈 SILVER",
    color: "text-slate-500 dark:text-slate-300",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-400/30",
    glowColor: "shadow-slate-400/10",
    gradient: "from-slate-400/20 via-slate-500/5 to-transparent",
  },
  {
    type: "gold",
    label: "Gold Tier",
    badgeTag: "🥇 GOLD",
    color: "text-amber-500 dark:text-amber-300",
    bgColor: "bg-amber-500/15",
    borderColor: "border-amber-400/40",
    glowColor: "shadow-amber-400/20",
    gradient: "from-amber-500/25 via-yellow-500/10 to-transparent",
  },
  {
    type: "fire",
    label: "Flame Tier",
    badgeTag: "🔥 FLAME",
    color: "text-orange-500 dark:text-orange-400",
    bgColor: "bg-orange-500/15",
    borderColor: "border-orange-500/40",
    glowColor: "shadow-orange-500/20",
    gradient: "from-orange-500/25 via-rose-500/10 to-transparent",
  },
  {
    type: "lightning",
    label: "Zap Tier",
    badgeTag: "⚡ ZAP",
    color: "text-indigo-500 dark:text-indigo-400",
    bgColor: "bg-indigo-500/15",
    borderColor: "border-indigo-500/40",
    glowColor: "shadow-indigo-500/20",
    gradient: "from-indigo-500/25 via-violet-500/10 to-transparent",
  },
  {
    type: "crown",
    label: "Crown Tier",
    badgeTag: "👑 CROWN",
    color: "text-purple-500 dark:text-purple-300",
    bgColor: "bg-purple-500/15",
    borderColor: "border-purple-500/40",
    glowColor: "shadow-purple-500/20",
    gradient: "from-purple-500/25 via-fuchsia-500/10 to-transparent",
  },
  {
    type: "diamond",
    label: "Diamond Tier",
    badgeTag: "💎 DIAMOND",
    color: "text-cyan-500 dark:text-cyan-300",
    bgColor: "bg-cyan-500/15",
    borderColor: "border-cyan-500/40",
    glowColor: "shadow-cyan-500/20",
    gradient: "from-cyan-500/25 via-teal-500/10 to-transparent",
  },
  {
    type: "emerald",
    label: "Emerald Tier",
    badgeTag: "❇️ EMERALD",
    color: "text-emerald-500 dark:text-emerald-300",
    bgColor: "bg-emerald-500/15",
    borderColor: "border-emerald-500/40",
    glowColor: "shadow-emerald-500/20",
    gradient: "from-emerald-500/25 via-green-500/10 to-transparent",
  },
  {
    type: "ruby",
    label: "Ruby Tier",
    badgeTag: "🌹 RUBY",
    color: "text-rose-500 dark:text-rose-300",
    bgColor: "bg-rose-500/15",
    borderColor: "border-rose-500/40",
    glowColor: "shadow-rose-500/20",
    gradient: "from-rose-500/25 via-pink-500/10 to-transparent",
  },
  {
    type: "cosmic",
    label: "Cosmic Tier",
    badgeTag: "🌌 COSMIC",
    color: "text-fuchsia-500 dark:text-fuchsia-300",
    bgColor: "bg-fuchsia-500/15",
    borderColor: "border-fuchsia-500/40",
    glowColor: "shadow-fuchsia-500/20",
    gradient: "from-fuchsia-500/25 via-indigo-500/10 to-transparent",
  },
];

export interface BadgeCategoryOption {
  value: BadgeCategory;
  label: string;
  badgeTag: string;
  description: string;
}

export const BADGE_CATEGORIES: BadgeCategoryOption[] = [
  {
    value: "QUEST",
    label: "Quest",
    badgeTag: "⚔️ QUEST",
    description: "Evaluations & Quest Arena milestones",
  },
  {
    value: "STREAK",
    label: "Streak",
    badgeTag: "🔥 STREAK",
    description: "Daily continuous study streak milestones",
  },
  {
    value: "BOSS",
    label: "Boss",
    badgeTag: "👑 BOSS",
    description: "Comprehensive subject board mock exams",
  },
  {
    value: "SUBJECT",
    label: "Subject",
    badgeTag: "📚 SUBJECT",
    description: "Subject mastery & proficiency goals",
  },
  {
    value: "EXAM",
    label: "Exam",
    badgeTag: "⚡ EXAM",
    description: "Speed & high precision exam solver",
  },
  {
    value: "PERFORMANCE",
    label: "Performance",
    badgeTag: "🎯 PERFORMANCE",
    description: "Accuracy & exam score performance tiers",
  },
  {
    value: "SPEED",
    label: "Speed",
    badgeTag: "⚡ SPEED",
    description: "Rapid completion under time limits",
  },
  {
    value: "MASTERY",
    label: "Mastery",
    badgeTag: "🌟 MASTERY",
    description: "Skill mastery & comprehensive review",
  },
  {
    value: "SPECIAL",
    label: "Special",
    badgeTag: "✨ SPECIAL",
    description: "Seasonal or institutional milestones",
  },
];

export interface BoardQuesterPreset {
  badgeId: string;
  title: string;
  name: string;
  description: string;
  category: BadgeCategory;
  badgeType: BadgeType;
  tier: string;
  iconName: string;
  spriteUrl: string;
  color: string;
  unlockCondition: string;
  xpReward: number;
}

export const BOARDQUESTERS_PRESETS: BoardQuesterPreset[] = [
  {
    badgeId: "master",
    title: "Master",
    name: "Master Badge",
    description: "Earned by completing a quest with 100% perfect accuracy. Peak medical tech mastery!",
    category: "PERFORMANCE",
    badgeType: "gold",
    tier: "GOLD",
    iconName: "Trophy",
    spriteUrl: "/ui/master-badge.png",
    color: "#FFD700",
    unlockCondition: "100% perfect accuracy",
    xpReward: 250,
  },
  {
    badgeId: "gold",
    title: "Gold",
    name: "Gold Badge",
    description: "Earned by completing a quest with 80-99% accuracy. Outstanding high performance!",
    category: "PERFORMANCE",
    badgeType: "gold",
    tier: "GOLD",
    iconName: "Trophy",
    spriteUrl: "/ui/gold-badge.png",
    color: "#FFD700",
    unlockCondition: "80-99% accuracy",
    xpReward: 150,
  },
  {
    badgeId: "silver",
    title: "Silver",
    name: "Silver Badge",
    description: "Earned by completing a quest with 60-79% accuracy. Solid medical board competence!",
    category: "PERFORMANCE",
    badgeType: "silver",
    tier: "SILVER",
    iconName: "Trophy",
    spriteUrl: "/ui/silver-badge.png",
    color: "#C0C0C0",
    unlockCondition: "60-79% accuracy",
    xpReward: 100,
  },
  {
    badgeId: "bronze",
    title: "Bronze",
    name: "Bronze Badge",
    description: "Earned by completing a quest with 40-59% accuracy. Good effort on your journey!",
    category: "PERFORMANCE",
    badgeType: "bronze",
    tier: "BRONZE",
    iconName: "Trophy",
    spriteUrl: "/ui/bronze-badge.png",
    color: "#CD7F32",
    unlockCondition: "40-59% accuracy",
    xpReward: 50,
  },
  {
    badgeId: "adept",
    title: "Adept",
    name: "Adept Badge",
    description: "Earned by maintaining a 7-day study streak or reaching high skill milestones.",
    category: "MASTERY",
    badgeType: "cosmic",
    tier: "STANDARD",
    iconName: "Star",
    spriteUrl: "/ui/adept-badge.png",
    color: "#7986CB",
    unlockCondition: "7-day streak or High Skill",
    xpReward: 150,
  },
  {
    badgeId: "speed",
    title: "Speed Master",
    name: "Speed Master Badge",
    description: "Earned by completing a quest in under 2 minutes. Lightning fast!",
    category: "SPEED",
    badgeType: "lightning",
    tier: "GOLD",
    iconName: "Zap",
    spriteUrl: "/ui/speedmaster-badge.png",
    color: "#FFD700",
    unlockCondition: "Complete under 2 min",
    xpReward: 75,
  },
  {
    badgeId: "streak-7",
    title: "7-Day Streak",
    name: "Consistent Champion",
    description: "Maintained a 7-day streak of consistent daily questing.",
    category: "STREAK",
    badgeType: "fire",
    tier: "STANDARD",
    iconName: "Flame",
    spriteUrl: "/ui/adept-badge.png",
    color: "#FF6B6B",
    unlockCondition: "7-day streak",
    xpReward: 150,
  },
  {
    badgeId: "streak-14",
    title: "14-Day Streak",
    name: "Unstoppable Streak",
    description: "Maintained a 14-day streak. Your dedication is inspiring!",
    category: "STREAK",
    badgeType: "fire",
    tier: "SILVER",
    iconName: "Flame",
    spriteUrl: "/ui/silver-badge.png",
    color: "#FF8C42",
    unlockCondition: "14-day streak",
    xpReward: 200,
  },
  {
    badgeId: "streak-30",
    title: "30-Day Streak",
    name: "Legendary Streak",
    description: "Maintained a 30-day streak. You are a true champion of BoardQuest!",
    category: "STREAK",
    badgeType: "fire",
    tier: "GOLD",
    iconName: "Flame",
    spriteUrl: "/ui/master-badge.png",
    color: "#FFB84D",
    unlockCondition: "30-day streak",
    xpReward: 300,
  },
  {
    badgeId: "boss-slayer",
    title: "Boss Slayer",
    name: "Subject Master Badge",
    description: "Conquered major subject board examination simulator.",
    category: "BOSS",
    badgeType: "crown",
    tier: "MYTHIC",
    iconName: "Crown",
    spriteUrl: "/ui/master-badge.png",
    color: "#9C27B0",
    unlockCondition: "Complete comprehensive subject mock exam",
    xpReward: 500,
  },
];

export const ICONS = [
  { name: "Medal", Icon: Medal, label: "Medal" },
  { name: "Trophy", Icon: Trophy, label: "Trophy" },
  { name: "Sparkles", Icon: Sparkles, label: "Sparkles" },
  { name: "Flame", Icon: Flame, label: "Flame" },
  { name: "Award", Icon: Award, label: "Award" },
  { name: "Crown", Icon: Crown, label: "Crown" },
  { name: "Zap", Icon: Zap, label: "Zap" },
  { name: "Gem", Icon: Gem, label: "Gem" },
  { name: "Target", Icon: Target, label: "Target" },
  { name: "ShieldCheck", Icon: ShieldCheck, label: "Shield" },
  { name: "Rocket", Icon: Rocket, label: "Rocket" },
  { name: "Star", Icon: Star, label: "Star" },
  { name: "Heart", Icon: Heart, label: "Heart" },
  { name: "Skull", Icon: Skull, label: "Skull" },
  { name: "Compass", Icon: Compass, label: "Compass" },
  { name: "BookOpen", Icon: BookOpen, label: "Book" },
  { name: "Swords", Icon: Swords, label: "Swords" },
  { name: "Flag", Icon: Flag, label: "Flag" },
  { name: "Feather", Icon: Feather, label: "Feather" },
];
