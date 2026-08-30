import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis";
export function createStore(prefix) {
    if (!redisClient || process.env.NODE_ENV === "test")
        return undefined;
    return new RedisStore({
        prefix,
        sendCommand: (command, ...args) => redisClient.call(command, ...args),
    });
}
/**
 * Global rate limiter to protect all API endpoints.
 * Limits each IP address to 1000 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    store: createStore("rl:api:"),
    skip: (req) => {
        // Skip in test environment, SSE stream, and CORS preflights
        return (process.env.NODE_ENV === "test" ||
            req.path.includes("/notifications/stream") ||
            req.method === "OPTIONS");
    },
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes.",
        error: "TOO_MANY_REQUESTS",
    },
});
/**
 * Strict rate limiter for sensitive authentication routes (e.g., login, signup).
 * Limits each IP address to 10 requests per 15 minutes.
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === "production" ? 15 : 200, // relaxed in development
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("rl:auth:"),
    skip: (req) => process.env.NODE_ENV === "test" ||
        (process.env.NODE_ENV !== "production" &&
            (req.ip === "127.0.0.1" ||
                req.ip === "::1" ||
                req.ip === "::ffff:127.0.0.1" ||
                req.hostname === "localhost")),
    message: {
        success: false,
        message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
        error: "TOO_MANY_REQUESTS",
    },
});
/**
 * High-Security Password Reset & OTP Limiter
 * requests per hour per IP (for /forgot-password)
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore("rl:pwd:"),
    skip: () => process.env.NODE_ENV === "test",
    message: {
        success: false,
        message: "Too many password reset requests. Please try again after 1 hour.",
        error: "TOO_MANY_REQUESTS",
    },
});
