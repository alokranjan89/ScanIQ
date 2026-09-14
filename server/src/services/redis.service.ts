import redis from "../config/redis.js";

export const getCache = async (
    key: string
): Promise<string | null> => {
    try {
        return await redis.get(key);
    } catch (error) {
        console.error("Redis GET failed:", error);
        return null;
    }
};

export const setCache = async (
    key: string,
    value: string,
    ttlSeconds: number
): Promise<void> => {
    try {
        await redis.set(
            key,
            value,
            "EX",
            ttlSeconds
        );
    } catch (error) {
        console.error("Redis SET failed:", error);
    }
};

export const deleteCache = async (
    key: string
): Promise<void> => {
    try {
        await redis.del(key);
    } catch (error) {
        console.error("Redis DELETE failed:", error);
    }
};