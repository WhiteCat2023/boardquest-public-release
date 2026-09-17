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
  isActive?: boolean;
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

export const BOARDQUESTERS_BADGE_DEFAULTS: Record<
  string,
  {
    name: string;
    title: string;
    category: string;
    icon: string;
    color: string;
    spriteUrl?: string;
    description: string;
    xpReward: number;
    unlockCondition?: string;
  }
> = {
  master: {
    name: "Master Badge",
    title: "Master Badge",
    category: "PERFORMANCE",
    icon: "trophy",
    color: "#ffd700",
    spriteUrl: "/ui/master-badge.png",
    description: "Achieved 100% accuracy on a quest.",
    xpReward: 250,
    unlockCondition: "Score 100% accuracy in a quest",
  },
  gold: {
    name: "Gold Badge",
    title: "Gold Badge",
    category: "PERFORMANCE",
    icon: "trophy",
    color: "#ffd700",
    spriteUrl: "/ui/gold-badge.png",
    description: "Achieved 80–99% accuracy on a quest.",
    xpReward: 150,
    unlockCondition: "Score 80-99% accuracy in a quest",
  },
  silver: {
    name: "Silver Badge",
    title: "Silver Badge",
    category: "PERFORMANCE",
    icon: "medal",
    color: "#c0c0c0",
    spriteUrl: "/ui/silver-badge.png",
    description: "Achieved 60–79% accuracy on a quest.",
    xpReward: 100,
    unlockCondition: "Score 60-79% accuracy in a quest",
  },
  bronze: {
    name: "Bronze Badge",
    title: "Bronze Badge",
    category: "PERFORMANCE",
    icon: "award",
    color: "#cd7f32",
    spriteUrl: "/ui/bronze-badge.png",
    description: "Achieved 40–59% accuracy on a quest.",
    xpReward: 50,
    unlockCondition: "Score 40-59% accuracy in a quest",
  },
  adept: {
    name: "Adept Learner",
    title: "Adept Learner",
    category: "STREAK",
    icon: "star",
    color: "#ff5722",
    spriteUrl: "/ui/adept-badge.png",
    description: "Maintained a 7-day study streak in the game.",
    xpReward: 150,
    unlockCondition: "7-day study streak",
  },
  speed: {
    name: "Speedmaster",
    title: "Speedmaster",
    category: "SPEED",
    icon: "zap",
    color: "#00e5ff",
    spriteUrl: "/ui/speedmaster-badge.png",
    description: "Completed a quest in under 2 minutes with passing accuracy.",
    xpReward: 75,
    unlockCondition: "Quest completed in < 2 minutes",
  },
  "streak-7": {
    name: "7-Day Streak",
    title: "7-Day Streak",
    category: "STREAK",
    icon: "flame",
    color: "#ff5722",
    description: "7 consecutive daily logins.",
    xpReward: 100,
    unlockCondition: "7 consecutive logins",
  },
  "streak-14": {
    name: "14-Day Streak",
    title: "14-Day Streak",
    category: "STREAK",
    icon: "flame",
    color: "#ff5722",
    description: "14 consecutive daily logins.",
    xpReward: 250,
    unlockCondition: "14 consecutive logins",
  },
  "streak-30": {
    name: "30-Day Streak",
    title: "30-Day Streak",
    category: "STREAK",
    icon: "crown",
    color: "#ffd700",
    description: "30 consecutive daily logins.",
    xpReward: 500,
    unlockCondition: "30 consecutive logins",
  },
  "boss-slayer": {
    name: "Boss Slayer",
    title: "Boss Slayer",
    category: "SPECIAL",
    icon: "swords",
    color: "#9c27b0",
    description: "Defeated an epic chapter boss quiz.",
    xpReward: 300,
    unlockCondition: "Defeat a chapter boss",
  },
};

/**
 * Maps student active earned badges (filtered on the backend) into UI StudentBadge objects.
 */
export function getStudentEarnedBadges(
  student: {
    userBadges?: any[];
    achievements?: any[];
  },
  dbBadges?: GameBadge[]
): StudentBadge[] {
  const userBadges = Array.isArray(student?.userBadges) ? student.userBadges : [];
  const achievements = Array.isArray(student?.achievements) ? student.achievements : [];

  // If userBadges are present (populated from backend with active badges), map each achieved badge
  if (userBadges.length > 0) {
    return userBadges.map((ub: any) => {
      let rawBadge = ub.badge || {};
      const slug = (ub.badgeSlug || rawBadge.badgeId || "").toLowerCase();

      // If ub.badge is missing or lacks basic info, attempt resolution against dbBadges
      if ((!rawBadge || !rawBadge.name) && dbBadges && dbBadges.length > 0) {
        const found = dbBadges.find(
          (b) =>
            (b.badgeId && b.badgeId.toLowerCase() === slug) ||
            (b.id && b.id === ub.badgeId)
        );
        if (found) {
          rawBadge = found;
        }
      }

      // Fallback preset if available
      const fallbackPreset = BOARDQUESTERS_BADGE_DEFAULTS[slug];
      const badgeId = ub.badgeSlug || rawBadge.badgeId || ub.badgeId || "badge";
      const title = rawBadge.title || rawBadge.name || fallbackPreset?.name || ub.badgeSlug || "Badge";
      const color = rawBadge.color || fallbackPreset?.color || "#ffd700";
      const tierStyling = getTierColors(color);
      const iconKey = rawBadge.icon || rawBadge.iconName || fallbackPreset?.icon || "trophy";
      const spriteUrl = rawBadge.spriteUrl || rawBadge.imageUrl || fallbackPreset?.spriteUrl || null;
      const description =
        rawBadge.description ||
        rawBadge.unlockCondition ||
        fallbackPreset?.description ||
        "Earned evaluation badge";
      const category = rawBadge.category || fallbackPreset?.category || "QUEST";
      const xpReward = ub.xpEarned || rawBadge.xpReward || fallbackPreset?.xpReward || 50;

      return {
        id: ub.id || ub.badgeId,
        badgeId,
        title,
        name: rawBadge.name || title,
        description,
        category,
        icon: resolveBadgeIcon(iconKey),
        spriteUrl,
        color: tierStyling.color,
        bgColor: tierStyling.bgColor,
        borderColor: tierStyling.borderColor,
        unlocked: true,
        unlockedAt: ub.unlockedAt,
        accuracy: ub.accuracy,
        confidenceLevel: ub.confidenceLevel,
        xpReward,
        unlockCondition: rawBadge.unlockCondition || fallbackPreset?.unlockCondition,
        isActive: true,
      };
    });
  }

  // Fallback: If legacy achievements exist and match active dbBadges, map earned ones
  if (dbBadges && dbBadges.length > 0 && achievements.length > 0) {
    const activeDbBadges = dbBadges.filter((b) => b.isActive !== false);
    return activeDbBadges
      .filter((badge) => {
        return achievements.some(
          (a: any) =>
            a.badge?.toLowerCase() === badge.badgeId?.toLowerCase() ||
            a.badge?.toLowerCase() === badge.id?.toLowerCase() ||
            (badge.name && a.task?.toLowerCase().includes(badge.name.toLowerCase()))
        );
      })
      .map((badge) => {
        const matchedAchievement = achievements.find(
          (a: any) =>
            a.badge?.toLowerCase() === badge.badgeId?.toLowerCase() ||
            a.badge?.toLowerCase() === badge.id?.toLowerCase() ||
            (badge.name && a.task?.toLowerCase().includes(badge.name.toLowerCase()))
        );
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
          unlocked: true,
          unlockedAt: matchedAchievement?.timestamp,
          accuracy: matchedAchievement?.accuracy ?? null,
          confidenceLevel: matchedAchievement?.confidenceLevel ?? null,
          xpReward: badge.xpReward || badge.xp || 50,
          unlockCondition: badge.unlockCondition,
          isActive: true,
        };
      });
  }

  return [];
}
