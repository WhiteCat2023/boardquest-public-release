import { ApiError } from "../../../utils/apiError";
/**
 * Validate game session input
 */
export const validateGameSessionInput = (req, res, next) => {
    const { score, total, subject, difficulty } = req.body;
    // Check required fields
    if (score === undefined || total === undefined || !subject) {
        throw new ApiError(400, "Missing required fields: score, total, subject");
    }
    // Check types
    if (typeof score !== "number" || typeof total !== "number") {
        throw new ApiError(400, "score and total must be numbers");
    }
    if (typeof subject !== "string") {
        throw new ApiError(400, "subject must be a string");
    }
    // Validate score ranges
    if (score < 0 || score > total || total <= 0) {
        throw new ApiError(400, "Invalid score values: score must be between 0 and total, total must be positive");
    }
    // Validate difficulty if provided
    if (difficulty && !["easy", "medium", "hard"].includes(difficulty)) {
        throw new ApiError(400, "Invalid difficulty: must be 'easy', 'medium', or 'hard'");
    }
    next();
};
/**
 * Validate game configuration update
 */
export const validateGameConfigUpdate = (req, res, next) => {
    const { baseXP, xpMultiplier, streakBonus, accuracyThreshold } = req.body;
    // Validate types if provided
    if (baseXP !== undefined && typeof baseXP !== "number") {
        throw new ApiError(400, "baseXP must be a number");
    }
    if (xpMultiplier !== undefined && typeof xpMultiplier !== "number") {
        throw new ApiError(400, "xpMultiplier must be a number");
    }
    if (streakBonus !== undefined && typeof streakBonus !== "number") {
        throw new ApiError(400, "streakBonus must be a number");
    }
    if (accuracyThreshold !== undefined && typeof accuracyThreshold !== "number") {
        throw new ApiError(400, "accuracyThreshold must be a number");
    }
    // Validate ranges if provided
    if (baseXP !== undefined && baseXP < 0) {
        throw new ApiError(400, "baseXP must be non-negative");
    }
    if (xpMultiplier !== undefined && xpMultiplier < 1) {
        throw new ApiError(400, "xpMultiplier must be at least 1");
    }
    if (streakBonus !== undefined && (streakBonus < 0 || streakBonus > 1)) {
        throw new ApiError(400, "streakBonus must be between 0 and 1");
    }
    if (accuracyThreshold !== undefined && (accuracyThreshold < 0 || accuracyThreshold > 100)) {
        throw new ApiError(400, "accuracyThreshold must be between 0 and 100");
    }
    next();
};
/**
 * Check admin privileges for game configuration
 */
export const requireGameAdmin = (req, res, next) => {
    const userRole = req.body.role;
    if (!userRole || !["DEAN", "SUPERADMIN"].includes(userRole)) {
        throw new ApiError(403, "Insufficient privileges: Only deans and superadmins can modify game configuration");
    }
    next();
};
