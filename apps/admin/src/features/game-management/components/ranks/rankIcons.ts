import {
  Crown,
  Trophy,
  Star,
  Award,
  Medal,
  ShieldCheck,
  Flame,
  Zap,
  Target,
  Gem,
  Sparkles,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const RANK_ICON_MAP: Record<string, LucideIcon> = {
  Award,
  Star,
  Trophy,
  Crown,
  Medal,
  ShieldCheck,
  Flame,
  Zap,
  Target,
  Gem,
  Sparkles,
  Rocket,
};

export const getRankIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return Award;
  return RANK_ICON_MAP[iconName] || Award;
};
