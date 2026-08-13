export type LeaderboardCategory = "overall" | "accuracy" | "streak" | "mastery";
export type TimeHorizon = "all-time font-sans" | "monthly" | "weekly";

export interface LeaderboardStudent {
  rank: number;
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  level: number;
  totalXP: number;
  accuracy: number;
  streak: number;
  masteredSubjectsCount: number;
  unlockedBadgesCount: number;
  rankChange: number; // e.g. +2, 0, -1
  topSubject: string;
}
