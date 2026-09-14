import { Redis } from "ioredis";
import { env } from "./env.js";

const RedisCtor = Redis as unknown as new (
    url: string,
    options?: {
        maxRetriesPerRequest?: number;
        retryStrategy?: (times: number) => number | null;
    }
) => {
    on(event: string, callback: (...args: unknown[]) => void): unknown;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, mode: string, ttl: number): Promise<unknown>;
    del(key: string): Promise<number>;
    quit(): Promise<"OK">;
};

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