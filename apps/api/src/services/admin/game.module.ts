import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface GameConfig {
  baseXP: number;
  xpMultiplier: number;
  streakBonus: number;
  accuracyThreshold: number;
}

export interface ScoringResult {
  xpEarned: number;
  streakBonus: number;
  totalXP: number;
  accuracyBonus: number;
}

export interface ProgressionResult {
  currentLevel: number;
  currentXP: number;
  nextLevelXP: number;
  leveledUp: boolean;
  newLevel?: number;
}

export interface AchievementUnlocked {
  id: string;
  type: string;
  badge?: string;
  xp: number;
  title: string;
}

export interface GameSessionResult {
  userId: string;
  score: number;
  total: number;
  accuracy: number;
  subject: string;
  xpEarned: number;
  achievements: AchievementUnlocked[];
  newLevel?: number;
  streakUpdated: number;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  level: number;
  totalXP: number;
  streak: number;
  rank: number;
}

// ============================================
// SCORING ENGINE (Subsystem 1)
// ============================================

class ScoringEngine {
  private config: GameConfig;

  constructor(config: Partial<GameConfig> = {}) {
    this.config = {
      baseXP: config.baseXP || 10,
      xpMultiplier: config.xpMultiplier || 1.5,
      streakBonus: config.streakBonus || 0.1,
      accuracyThreshold: config.accuracyThreshold || 70,
    };
  }

  calculateXP(
    score: number,
    total: number,
    streak: number,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ): ScoringResult {
    const accuracy = (score / total) * 100;
    const difficultyMultiplier = this.getDifficultyMultiplier(difficulty);

    // Base XP calculation
    let baseXP = Math.floor((score / total) * this.config.baseXP * 10);
    baseXP = Math.max(baseXP, 5); // Minimum 5 XP

    // Apply difficulty multiplier
    let xpEarned = Math.floor(baseXP * difficultyMultiplier);

    // Accuracy bonus
    const accuracyBonus =
      accuracy >= this.config.accuracyThreshold
        ? Math.floor(xpEarned * 0.2)
        : 0;

    // Streak bonus
    const streakBonus = Math.floor(xpEarned * this.config.streakBonus * streak);

    const totalXP = xpEarned + accuracyBonus + streakBonus;

    return {
      xpEarned,
      streakBonus,
      totalXP,
      accuracyBonus,
    };
  }

  private getDifficultyMultiplier(
    difficulty: "easy" | "medium" | "hard"
  ): number {
    const multipliers: Record<string, number> = {
      easy: 1.0,
      medium: this.config.xpMultiplier,
      hard: this.config.xpMultiplier * 1.5,
    };
    return multipliers[difficulty] || 1.0;
  }
}

// ============================================
// PROGRESSION ENGINE (Subsystem 2)
// ============================================

class ProgressionEngine {
  private xpPerLevel = 1000;

  calculateLevelUp(currentXP: number, newXPGained: number): ProgressionResult {
    const totalXP = currentXP + newXPGained;
    const currentLevel = Math.floor(totalXP / this.xpPerLevel) + 1;
    const nextLevelXP = currentLevel * this.xpPerLevel;
    const previousLevel = Math.floor(currentXP / this.xpPerLevel) + 1;

    return {
      currentLevel,
      currentXP: totalXP,
      nextLevelXP,
      leveledUp: currentLevel > previousLevel,
      newLevel: currentLevel > previousLevel ? currentLevel : undefined,
    };
  }

  getProgressToNextLevel(
    currentXP: number
  ): { progress: number; percentToNext: number } {
    const currentLevel = Math.floor(currentXP / this.xpPerLevel) + 1;
    const currentLevelStart = (currentLevel - 1) * this.xpPerLevel;
    const currentLevelEnd = currentLevel * this.xpPerLevel;
    const progress = currentXP - currentLevelStart;
    const percentToNext = (progress / (currentLevelEnd - currentLevelStart)) * 100;

    return {
      progress,
      percentToNext: Math.min(percentToNext, 100),
    };
  }
}

// ============================================
// ACHIEVEMENT MANAGER (Subsystem 3)
// ============================================

class AchievementManager {
  private achievements = {
    first_quest: { title: "First Step", badge: "bronze", xp: 50 },
    perfect_score: { title: "Perfectionist", badge: "gold", xp: 200 },
    accuracy_90: { title: "Sharp Mind", badge: "silver", xp: 150 },
    streak_5: { title: "On Fire", badge: "fire", xp: 100 },
    streak_10: { title: "Unstoppable", badge: "lightning", xp: 300 },
    mastery_100: { title: "Subject Master", badge: "crown", xp: 500 },
    level_10: { title: "Decennial", badge: "diamond", xp: 400 },
  };

  checkAchievements(
    userId: string,
    score: number,
    total: number,
    accuracy: number,
    streak: number,
    level: number,
    masteryLevel: number
  ): AchievementUnlocked[] {
    const unlockedAchievements: AchievementUnlocked[] = [];

    // First quest
    if (score > 0) {
      unlockedAchievements.push({
        id: "first_quest",
        type: "quest",
        badge: "bronze",
        xp: 50,
        title: "First Step",
      });
    }

    // Perfect score
    if (score === total) {
      unlockedAchievements.push({
        id: "perfect_score",
        type: "exam",
        badge: "gold",
        xp: 200,
        title: "Perfectionist",
      });
    }

    // Accuracy achievements
    if (accuracy >= 90) {
      unlockedAchievements.push({
        id: "accuracy_90",
        type: "exam",
        badge: "silver",
        xp: 150,
        title: "Sharp Mind",
      });
    }

    // Streak achievements
    if (streak >= 5) {
      unlockedAchievements.push({
        id: "streak_5",
        type: "quest",
        badge: "fire",
        xp: 100,
        title: "On Fire",
      });
    }

    if (streak >= 10) {
      unlockedAchievements.push({
        id: "streak_10",
        type: "quest",
        badge: "lightning",
        xp: 300,
        title: "Unstoppable",
      });
    }

    // Mastery achievement
    if (masteryLevel >= 100) {
      unlockedAchievements.push({
        id: "mastery_100",
        type: "quest",
        badge: "crown",
        xp: 500,
        title: "Subject Master",
      });
    }

    // Level achievement
    if (level >= 10) {
      unlockedAchievements.push({
        id: "level_10",
        type: "quest",
        badge: "diamond",
        xp: 400,
        title: "Decennial",
      });
    }

    return unlockedAchievements;
  }
}

// ============================================
// STREAK MANAGER (Subsystem 4)
// ============================================

class StreakManager {
  updateStreak(
    currentStreak: number,
    accuracy: number,
    accuracyThreshold: number = 70
  ): number {
    if (accuracy >= accuracyThreshold) {
      return currentStreak + 1;
    } else {
      return 0; // Reset streak on failure
    }
  }

  getStreakMultiplier(streak: number): number {
    // Every 5 streaks = +10% bonus
    return 1 + (Math.floor(streak / 5) * 0.1);
  }
}

// ============================================
// LEADERBOARD MANAGER (Subsystem 5)
// ============================================

class LeaderboardManager {
  async getLeaderboard(
    limit: number = 10,
    subject?: string
  ): Promise<LeaderboardEntry[]> {
    try {
      const users = await prisma.user.findMany({
        orderBy: [{ level: "desc" }, { xp: "desc" }],
        take: limit,
        select: { id: true, name: true, level: true, xp: true, streak: true },
      });

      return users.map((user: any, index: number) => ({
        userId: user.id,
        userName: user.name,
        level: user.level,
        totalXP: user.xp,
        streak: user.streak,
        rank: index + 1,
      }));
    } catch (error) {
      throw new ApiError(
        500,
        "Failed to fetch leaderboard",
        [String(error)]
      );
    }
  }

  async getUserRank(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { level: true, xp: true },
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const rank = await prisma.user.count({
        where: {
          OR: [
            { level: { gt: user.level } },
            {
              AND: [
                { level: user.level },
                { xp: { gt: user.xp } },
              ],
            },
          ],
        },
      });

      return rank + 1;
    } catch (error) {
      throw new ApiError(500, "Failed to fetch user rank", [String(error)]);
    }
  }
}

// ============================================
// GAME FACADE (Main Interface)
// ============================================

class GameFacade {
  private scoringEngine: ScoringEngine;
  private progressionEngine: ProgressionEngine;
  private achievementManager: AchievementManager;
  private streakManager: StreakManager;
  private leaderboardManager: LeaderboardManager;
  private gameConfig: GameConfig;

  constructor(config: Partial<GameConfig> = {}) {
    this.gameConfig = {
      baseXP: config.baseXP || 10,
      xpMultiplier: config.xpMultiplier || 1.5,
      streakBonus: config.streakBonus || 0.1,
      accuracyThreshold: config.accuracyThreshold || 70,
    };

    this.scoringEngine = new ScoringEngine(this.gameConfig);
    this.progressionEngine = new ProgressionEngine();
    this.achievementManager = new AchievementManager();
    this.streakManager = new StreakManager();
    this.leaderboardManager = new LeaderboardManager();
  }

  /**
   * Process a complete game session result
   * This is the main method that coordinates all game logic
   */
  async processGameSession(
    userId: string,
    score: number,
    total: number,
    subject: string,
    difficulty: "easy" | "medium" | "hard" = "medium"
  ): Promise<GameSessionResult> {
    try {
      // Fetch current user state
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, streak: true, name: true },
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Calculate accuracy
      const accuracy = (score / total) * 100;

      // Step 1: Calculate XP
      const scoringResult = this.scoringEngine.calculateXP(
        score,
        total,
        user.streak,
        difficulty
      );

      // Step 2: Update streak
      const newStreak = this.streakManager.updateStreak(
        user.streak,
        accuracy,
        this.gameConfig.accuracyThreshold
      );

      // Step 3: Calculate progression
      const progressionResult = this.progressionEngine.calculateLevelUp(
        user.xp,
        scoringResult.totalXP
      );

      // Step 4: Check for achievements
      let masteryLevel = 0;
      const subjectMastery = await prisma.subjectMastery.findUnique({
        where: { userId_subject: { userId, subject } },
        select: { proficiency: true },
      });
      if (subjectMastery) {
        masteryLevel = Math.min(
          subjectMastery.proficiency +
            Math.floor((accuracy / 100) * 10),
          100
        );
      }

      const achievements = this.achievementManager.checkAchievements(
        userId,
        score,
        total,
        accuracy,
        newStreak,
        progressionResult.currentLevel,
        masteryLevel
      );

      // Step 5: Calculate total XP with achievements
      const achievementXP = achievements.reduce((sum, ach) => sum + ach.xp, 0);
      const finalXP = scoringResult.totalXP + achievementXP;

      // Step 6: Update database
      await Promise.all([
        prisma.user.update({
          where: { id: userId },
          data: {
            xp: progressionResult.currentXP + achievementXP,
            level: progressionResult.currentLevel,
            streak: newStreak,
          },
        }),
        prisma.examResult.create({
          data: {
            userId,
            score,
            total,
            accuracy,
            subject,
          },
        }),
        ...achievements.map((achievement) =>
          prisma.achievement.create({
            data: {
              userId,
              task: achievement.title,
              type: achievement.type,
              badge: achievement.badge,
              xp: achievement.xp,
              accuracy,
              subject,
            },
          })
        ),
        subjectMastery
          ? prisma.subjectMastery.update({
              where: { userId_subject: { userId, subject } },
              data: { proficiency: masteryLevel },
            })
          : prisma.subjectMastery.create({
              data: {
                userId,
                subject,
                proficiency: masteryLevel,
              },
            }),
      ]);

      return {
        userId,
        score,
        total,
        accuracy,
        subject,
        xpEarned: finalXP,
        achievements,
        newLevel: progressionResult.newLevel,
        streakUpdated: newStreak,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Failed to process game session",
        [String(error)]
      );
    }
  }

  /**
   * Get user game statistics
   */
  async getUserGameStats(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          level: true,
          xp: true,
          streak: true,
          achievements: { select: { badge: true, xp: true } },
          examResults: {
            orderBy: { timestamp: "desc" },
            take: 10,
            select: { score: true, total: true, accuracy: true, subject: true },
          },
          mastery: { select: { subject: true, proficiency: true } },
        },
      });

      if (!user) {
        throw new ApiError(404, "User not found");
      }

      const rank = await this.leaderboardManager.getUserRank(userId);
      const progressToNextLevel =
        this.progressionEngine.getProgressToNextLevel(user.xp);

      return {
        name: user.name,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        rank,
        progressToNextLevel,
        achievements: user.achievements,
        recentExams: user.examResults,
        subjectMastery: user.mastery,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Failed to fetch user game stats",
        [String(error)]
      );
    }
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 10, subject?: string) {
    return this.leaderboardManager.getLeaderboard(limit, subject);
  }

  /**
   * Get user's rank on leaderboard
   */
  async getUserRank(userId: string): Promise<number> {
    return this.leaderboardManager.getUserRank(userId);
  }

  /**
   * Reset user streak (e.g., due to inactivity or manual reset)
   */
  async resetStreak(userId: string): Promise<number> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { streak: 0 },
        select: { streak: true },
      });
      return user.streak;
    } catch (error) {
      throw new ApiError(500, "Failed to reset streak", [String(error)]);
    }
  }

  /**
   * Get configuration
   */
  getConfig(): GameConfig {
    return { ...this.gameConfig };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<GameConfig>): void {
    this.gameConfig = { ...this.gameConfig, ...newConfig };
    // Reinitialize engines with new config
    this.scoringEngine = new ScoringEngine(this.gameConfig);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let gameFacadeInstance: GameFacade | null = null;

export const getGameFacade = (config?: Partial<GameConfig>): GameFacade => {
  if (!gameFacadeInstance) {
    gameFacadeInstance = new GameFacade(config);
  }
  return gameFacadeInstance;
};

export const resetGameFacade = (): void => {
  gameFacadeInstance = null;
};

// ============================================
// EXPORT SUBSYSTEM CLASSES FOR TESTING
// ============================================

export {
  ScoringEngine,
  ProgressionEngine,
  AchievementManager,
  StreakManager,
  LeaderboardManager,
  GameFacade,
};
