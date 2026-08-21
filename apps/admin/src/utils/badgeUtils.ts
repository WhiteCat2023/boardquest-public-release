import {
  Award,
  Flame,
  Zap,
  Crown,
  Sparkles,
  Gem,
  Medal,
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
  Trophy,
} from "lucide-react";
import type { GameBadge } from "@/features/game-management/types/types";

export const ICON_MAP: Record<string, any> = {
  medal: Medal,
  trophy: Trophy,
  sparkles: Sparkles,
  flame: Flame,
  award: Award,
  crown: Crown,
  zap: Zap,
  gem: Gem,
  target: Target,
  shieldcheck: ShieldCheck,
  shield: ShieldCheck,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  skull: Skull,
  compass: Compass,
  bookopen: BookOpen,
  book: BookOpen,
  swords: Swords,
  flag: Flag,
  feather: Feather,
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
};

export interface StudentBadge {
  id: string;
  badgeId: string;
  title: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  spriteUrl?: string | null;
  color: string;
  bgColor: string;
  borderColor: string;
  unlocked: boolean;
  unlockedAt?: string | Date;
  accuracy?: number | null;
  confidenceLevel?: string | null;
  xpReward: number;
  unlockCondition?: string;
}

export function resolveBadgeIcon(iconName?: string) {
  if (!iconName) return Trophy;
  const key = iconName.toLowerCase().trim();
  return ICON_MAP[key] || ICON_MAP[iconName] || Trophy;
}

export function getTierColors(colorStr?: string) {
  const c = (colorStr || "").toLowerCase();
  if (c.includes("ffd700") || c.includes("gold") || c.includes("amber-500")) {
    return {
      color: "text-amber-500 dark:text-amber-300",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-400/30",
    };
  }
  if (c.includes("c0c0c0") || c.includes("silver") || c.includes("slate")) {
    return {
      color: "text-slate-500 dark:text-slate-300",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-400/30",
    };
  }
  if (c.includes("cd7f32") || c.includes("bronze") || c.includes("amber-600")) {
    return {
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
    };
  }
  if (c.includes("ff5722") || c.includes("orange") || c.includes("fire")) {
    return {
      color: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
    };
  }
  if (c.includes("00e5ff") || c.includes("cyan") || c.includes("zap") || c.includes("speed")) {
    return {
      color: "text-cyan-500 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
    };
  }
  if (c.includes("9c27b0") || c.includes("purple") || c.includes("boss") || c.includes("crown")) {
    return {
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
    };
  }
  return {
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/25",
  };
}

/**
 * Fetch and map student badge status strictly from DB badges & student unlocked records
 */
export function getStudentEarnedBadges(
  student: {
    userBadges?: any[];
    achievements?: any[];
  },
  dbBadges: GameBadge[] = []
): StudentBadge[] {
  const userBadges = Array.isArray(student?.userBadges) ? student.userBadges : [];
  const achievements = Array.isArray(student?.achievements) ? student.achievements : [];

  // If DB badges list is provided, map each configured badge in the DB
  if (dbBadges && dbBadges.length > 0) {
    return dbBadges.map((badge) => {
      // Check if unlocked in userBadges or achievements
      const matchedUserBadge = userBadges.find(
        (ub: any) =>
          ub.badgeId === badge.id ||
          ub.badgeSlug?.toLowerCase() === badge.badgeId?.toLowerCase() ||
          ub.badgeSlug?.toLowerCase() === badge.id?.toLowerCase()
      );

      const matchedAchievement = achievements.find(
        (a: any) =>
          a.badge?.toLowerCase() === badge.badgeId?.toLowerCase() ||
          a.badge?.toLowerCase() === badge.id?.toLowerCase() ||
          (badge.name && a.task?.toLowerCase().includes(badge.name.toLowerCase()))
      );

      const isUnlocked = Boolean(matchedUserBadge || matchedAchievement);
      const tierStyling = getTierColors(badge.color);

      return {
        id: badge.id,
        badgeId: badge.badgeId,
        title: badge.title || badge.name,
        name: badge.name || badge.title,
        description:
          badge.description || badge.unlockCondition || "Earned through academic excellence.",
        category: badge.category || "QUEST",
        icon: resolveBadgeIcon(badge.icon || badge.iconName),
        spriteUrl: badge.spriteUrl || badge.imageUrl,
        color: tierStyling.color,
        bgColor: tierStyling.bgColor,
        borderColor: tierStyling.borderColor,
        unlocked: isUnlocked,
        unlockedAt: matchedUserBadge?.unlockedAt || matchedAchievement?.timestamp,
        accuracy: matchedUserBadge?.accuracy ?? matchedAchievement?.accuracy ?? null,
        confidenceLevel:
          matchedUserBadge?.confidenceLevel ?? matchedAchievement?.confidenceLevel ?? null,
        xpReward: badge.xpReward || badge.xp || 50,
        unlockCondition: badge.unlockCondition,
      };
    });
  }

  // Fallback: If dbBadges is not provided (e.g. in quick table row), extract only what the student has unlocked in DB
  return userBadges.map((ub: any) => {
    const rawBadge = ub.badge || {};
    const badgeId = ub.badgeSlug || rawBadge.badgeId || ub.badgeId || "badge";
    const title = rawBadge.title || rawBadge.name || ub.badgeSlug || "Badge";
    const tierStyling = getTierColors(rawBadge.color);

    return {
      id: ub.id || ub.badgeId,
      badgeId,
      title,
      name: rawBadge.name || title,
      description: rawBadge.description || "Earned evaluation badge",
      category: rawBadge.category || "QUEST",
      icon: resolveBadgeIcon(rawBadge.icon || "trophy"),
      spriteUrl: rawBadge.spriteUrl || null,
      color: tierStyling.color,
      bgColor: tierStyling.bgColor,
      borderColor: tierStyling.borderColor,
      unlocked: true,
      unlockedAt: ub.unlockedAt,
      accuracy: ub.accuracy,
      confidenceLevel: ub.confidenceLevel,
      xpReward: ub.xpEarned || rawBadge.xpReward || 50,
      unlockCondition: rawBadge.unlockCondition,
    };
  });
}
