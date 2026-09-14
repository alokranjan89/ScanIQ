import * as RedisModule from "ioredis";
import { env } from "./env.js";

const RedisCtor =
    (RedisModule as any).Redis ??
    (RedisModule as any).default;

const redis = new RedisCtor(env.redisUrl, {
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