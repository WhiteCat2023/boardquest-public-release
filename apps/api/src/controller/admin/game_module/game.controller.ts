import { Request, Response } from "express";
import { getGameFacade } from "../../../services/admin/game.module";
import { ApiError } from "../../../utils/apiError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiResponse } from "../../../utils/apiResponse";

const gameFacade = getGameFacade();

/**
 * Process a quiz/exam completion and update user game stats
 */
export const completeGameSession = asyncHandler(
  async (req: Request, res: Response) => {
    const { score, total, subject, difficulty = "medium" } = req.body;
    const userId = req.body.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    // Validate input
    if (typeof score !== "number" || typeof total !== "number" || !subject) {
      throw new ApiError(
        400,
        "Invalid input: score, total, and subject are required",
      );
    }

    if (score < 0 || score > total || total <= 0) {
      throw new ApiError(400, "Invalid score values");
    }

    // Process game session
    const result = await gameFacade.processGameSession(
      userId,
      score,
      total,
      subject,
      difficulty as "easy" | "medium" | "hard",
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Game session processed successfully"),
      );
  },
);

/**
 * Get user's game statistics and progress
 */
export const getUserGameStats = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const stats = await gameFacade.getUserGameStats(userId);

    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Game statistics retrieved successfully"),
      );
  },
);

/**
 * Get global leaderboard
 */
export const getLeaderboard = asyncHandler(
  async (req: Request, res: Response) => {
    const { limit = 10, subject } = req.query;

    const leaderboard = await gameFacade.getLeaderboard(
      parseInt(limit as string) || 10,
      subject as string,
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, leaderboard, "Leaderboard retrieved successfully"),
      );
  },
);

/**
 * Get user's current rank
 */
export const getUserRank = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.body.user?.id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const rank = await gameFacade.getUserRank(userId);

  res
    .status(200)
    .json(new ApiResponse(200, { rank }, "User rank retrieved successfully"));
});

/**
 * Reset user's streak (admin only or user action)
 */
export const resetUserStreak = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.body.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized");
    }

    const newStreak = await gameFacade.resetStreak(userId);

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { streak: newStreak },
          "Streak reset successfully",
        ),
      );
  },
);

/**
 * Get game configuration (admin only)
 */
export const getGameConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const config = gameFacade.getConfig();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          config,
          "Game configuration retrieved successfully",
        ),
      );
  },
);

/**
 * Update game configuration (admin only)
 */
export const updateGameConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const { baseXP, xpMultiplier, streakBonus, accuracyThreshold } = req.body;

    // Validate at least one field is provided
    if (!baseXP && !xpMultiplier && !streakBonus && !accuracyThreshold) {
      throw new ApiError(400, "At least one configuration value is required");
    }

    gameFacade.updateConfig({
      baseXP,
      xpMultiplier,
      streakBonus,
      accuracyThreshold,
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          gameFacade.getConfig(),
          "Game configuration updated successfully",
        ),
      );
  },
);
