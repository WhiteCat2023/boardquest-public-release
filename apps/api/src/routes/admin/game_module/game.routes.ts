import { Router } from "express";
import {
  getAllBadges,
  getBadgeById,
  createBadge,
  updateBadge,
  toggleBadgeActive,
  deleteBadge,
} from "../../../controller/admin/game_module/gameBadge.controller";
import {
  getGameConfig,
  updateGameConfig,
  getLeaderboard,
  getUserGameStats,
  getUserRank,
  completeGameSession,
  resetUserStreak,
} from "../../../controller/admin/game_module/game.controller";
import {
  authenticateToken,
  requireRoles,
  optionalAuth,
} from "../../../middleware/auth.middleware";

const router = Router();

// ============================================
// BADGES MANAGEMENT ROUTES
// ============================================
router.get("/badges", optionalAuth, getAllBadges);
router.get("/badges/:id", optionalAuth, getBadgeById);
router.post(
  "/badges",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  createBadge
);
router.put(
  "/badges/:id",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  updateBadge
);
router.patch(
  "/badges/:id/toggle",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  toggleBadgeActive
);
router.delete(
  "/badges/:id",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN", "TEAMLEAD"]),
  deleteBadge
);

// ============================================
// GAME CONFIG / SCORING ENGINE RULES
// ============================================
router.get("/config", optionalAuth, getGameConfig);
router.put(
  "/config",
  authenticateToken,
  requireRoles(["SUPERADMIN", "DEAN"]),
  updateGameConfig
);

// ============================================
// LEADERBOARD & STUDENT GAMEPLAY
// ============================================
router.get("/leaderboard", optionalAuth, getLeaderboard);
router.get("/stats", optionalAuth, getUserGameStats);
router.get("/stats/:userId", optionalAuth, getUserGameStats);
router.get("/rank", optionalAuth, getUserRank);
router.get("/rank/:userId", optionalAuth, getUserRank);
router.post("/session/complete", optionalAuth, completeGameSession);
router.post("/streak/reset", authenticateToken, resetUserStreak);

export default router;
