import { Award, Flame, Zap, Crown, Sparkles, Gem, Medal } from "lucide-react";

export interface StudentBadge {
  id: string;
  title: string;
  badgeType: "bronze" | "silver" | "gold" | "fire" | "lightning" | "crown" | "diamond";
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  unlocked: boolean;
}

export function getStudentEarnedBadges(student: {
  level?: number;
  xp?: number;
  streak?: number;
  mastery?: any[];
  achievements?: any[];
}): StudentBadge[] {
  const level = student?.level || 1;
  const xp = student?.xp || 0;
  const streak = student?.streak || 0;
  const masteryCount = Array.isArray(student?.mastery) ? student.mastery.length : 0;

  const allBadges: StudentBadge[] = [
    {
      id: "first_step",
      title: "First Step",
      badgeType: "bronze",
      description: "Enrolled & completed initial evaluation quest",
      icon: Medal,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      unlocked: true,
    },
    {
      id: "sharp_mind",
      title: "Sharp Mind",
      badgeType: "silver",
      description: "Achieved high accuracy on evaluation questions",
      icon: Sparkles,
      color: "text-slate-600 dark:text-slate-300",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
      unlocked: level >= 2 || xp >= 100,
    },
    {
      id: "on_fire",
      title: "On Fire",
      badgeType: "fire",
      description: "Maintained an active evaluation streak",
      icon: Flame,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      unlocked: streak >= 3 || level >= 2,
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      badgeType: "gold",
      description: "Scored top marks in board subject evaluations",
      icon: Award,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      unlocked: level >= 3 || xp >= 250,
    },
    {
      id: "subject_master",
      title: "Subject Master",
      badgeType: "crown",
      description: "Achieved mastery proficiency in major board subject",
      icon: Crown,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      unlocked: masteryCount > 0 || level >= 4 || xp >= 400,
    },
    {
      id: "unstoppable",
      title: "Unstoppable",
      badgeType: "lightning",
      description: "Maintained an extended study streak & XP gain",
      icon: Zap,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      unlocked: streak >= 7 || xp >= 500 || level >= 5,
    },
    {
      id: "decennial",
      title: "Decennial Scholar",
      badgeType: "diamond",
      description: "Reached elite Level 10 academic status",
      icon: Gem,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      unlocked: level >= 10 || xp >= 1000,
    },
  ];

  return allBadges;
}
