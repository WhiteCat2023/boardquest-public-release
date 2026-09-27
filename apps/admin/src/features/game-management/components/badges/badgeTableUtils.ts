import { Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { GameBadge } from "../../types/types";
import {
  BADGE_TYPES,
  ICONS,
  type BadgeTierMeta,
} from "../badge-editor/badgeEditorConstants";

const BADGE_ICON_MAP: Record<string, LucideIcon> = Object.fromEntries(
  ICONS.map((i) => [i.name.toLowerCase(), i.Icon])
);

export const getBadgeIcon = (iconName?: string | null): LucideIcon => {
  if (!iconName) return Trophy;
  return BADGE_ICON_MAP[iconName.toLowerCase()] || Trophy;
};

export const getTierMeta = (
  badgeOrType?: GameBadge | string | null
): BadgeTierMeta => {
  if (!badgeOrType) return BADGE_TYPES[0];
  if (typeof badgeOrType === "string") {
    return (
      BADGE_TYPES.find((b) => b.type === badgeOrType) || BADGE_TYPES[0]
    );
  }
  const badge = badgeOrType;
  const rawType = (badge.badgeType || badge.tier || "").toLowerCase();
  const match = BADGE_TYPES.find((b) => b.type.toLowerCase() === rawType);
  if (match) return match;

  const c = (badge.color || "").toLowerCase();
  if (c.includes("ffd700") || c.includes("gold") || c.includes("amber-500")) {
    return BADGE_TYPES.find((b) => b.type === "gold") || BADGE_TYPES[0];
  }
  if (c.includes("c0c0c0") || c.includes("silver") || c.includes("slate")) {
    return BADGE_TYPES.find((b) => b.type === "silver") || BADGE_TYPES[0];
  }
  if (c.includes("cd7f32") || c.includes("bronze") || c.includes("amber-600")) {
    return BADGE_TYPES.find((b) => b.type === "bronze") || BADGE_TYPES[0];
  }
  if (c.includes("ff5722") || c.includes("orange") || c.includes("fire")) {
    return BADGE_TYPES.find((b) => b.type === "fire") || BADGE_TYPES[0];
  }
  if (c.includes("00e5ff") || c.includes("cyan") || c.includes("speed")) {
    return (
      BADGE_TYPES.find((b) => (b.type as string) === "speed") ||
      BADGE_TYPES.find((b) => b.type === "lightning") ||
      BADGE_TYPES[0]
    );
  }
  if (c.includes("9c27b0") || c.includes("purple") || c.includes("boss")) {
    return (
      BADGE_TYPES.find((b) => (b.type as string) === "master") ||
      BADGE_TYPES.find((b) => b.type === "cosmic") ||
      BADGE_TYPES[0]
    );
  }
  return BADGE_TYPES[0];
};
