import Redis from "ioredis";
const redisUrl = process.env.REDIS_URL;
let redisClient = null;
// Only connect to Redis if REDIS_URL is set and not running automated tests
if (redisUrl && process.env.NODE_ENV !== "test") {
    redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        lazyConnect: true,
        connectTimeout: 5000,
        retryStrategy(times) {
            // Do not endlessly retry if the host is unreachable (e.g. Render internal URL on localhost)
            if (times > 3) {
                return null;
            }
            return Math.min(times * 200, 1000);
        },
    });
    redisClient.on("connect", () => {
        console.log("[Redis] Connected Successfully!");
    });
    redisClient.on("error", (e) => {
        console.warn("[Redis] Connection Error (fallback to memory):", e.message);
    });
    redisClient.connect().catch((e) => {
        console.warn("[Redis] Could not connect to Redis, using in-memory fallback:", e.message);
    });
}
export default redisClient;
