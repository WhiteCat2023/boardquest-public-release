import rateLimit from "express-rate-limit";
/**
 * Global rate limiter to protect all API endpoints.
 * Limits each IP address to 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
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
    max: 10, // limit each IP to 10 login/signup attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many authentication attempts from this IP. Please try again after 15 minutes.",
        error: "TOO_MANY_REQUESTS",
    },
});
