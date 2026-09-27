import {
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
} from "lucide-react";
import type { RankTier } from "../../types/types";

export interface RankEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank?: RankTier | null;
  onSave: (rankData: Partial<RankTier>) => Promise<void> | void;
  isSaving?: boolean;
}

export const ICONS_LIST = [
  { name: "Award", icon: Award, label: "Award" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "Trophy", icon: Trophy, label: "Trophy" },
  { name: "Crown", icon: Crown, label: "Crown" },
  { name: "Medal", icon: Medal, label: "Medal" },
  { name: "ShieldCheck", icon: ShieldCheck, label: "Shield" },
  { name: "Flame", icon: Flame, label: "Flame" },
  { name: "Zap", icon: Zap, label: "Zap" },
  { name: "Target", icon: Target, label: "Target" },
  { name: "Gem", icon: Gem, label: "Gem" },
  { name: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "Rocket", icon: Rocket, label: "Rocket" },
];

export const PRESET_COLORS = [
  { label: "Slate", hex: "#64748B", bg: "bg-slate-500" },
  { label: "Blue", hex: "#3B82F6", bg: "bg-blue-500" },
  { label: "Purple", hex: "#A855F7", bg: "bg-purple-500" },
  { label: "Amber", hex: "#F59E0B", bg: "bg-amber-500" },
  { label: "Emerald", hex: "#10B981", bg: "bg-emerald-500" },
  { label: "Rose", hex: "#F43F5E", bg: "bg-rose-500" },
  { label: "Cyan", hex: "#06B6D4", bg: "bg-cyan-500" },
  { label: "Indigo", hex: "#6366F1", bg: "bg-indigo-500" },
];

export function calculateMinXp(minLevel: number): number {
  return minLevel > 1 ? Math.pow(minLevel - 1, 2) * 100 : 0;
}

export function getRankIconComponent(iconName: string) {
  return (
    ICONS_LIST.find((i) => i.name.toLowerCase() === iconName.toLowerCase())
      ?.icon || Award
  );
}
