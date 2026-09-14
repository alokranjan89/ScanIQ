import { Redis } from "ioredis";
import { env } from "./env.js";

const redis = new Redis(env.redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times: number) => {
        if (times >= 3) {
            console.error("Redis unavailable. Cache disabled.");
            return null;
        }

        return Math.min(times * 200, 1000);
    },
});

redis.on("connect", () => {
    console.log("Redis connected");
});

redis.on("error", (error: unknown) => {
    console.error("Redis error:", error);
});

export default redis;