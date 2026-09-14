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

export const setJsonCache = async <T>(
    key: string,
    value: T,
    ttlSeconds: number
): Promise<void> => {
    try {
        await redis.set(
            key,
            JSON.stringify(value),
            "EX",
            ttlSeconds
        );
    } catch (error) {
        console.error("Redis JSON SET failed:", error);
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

export const getJsonCache = async <T>(
    key: string
): Promise<{ hit: boolean; value: T | null }> => {
    const cachedValue = await getCache(key);

    if (cachedValue === null) {
        return {
            hit: false,
            value: null,
        };
    }

    try {
        return {
            hit: true,
            value: JSON.parse(cachedValue) as T | null,
        };
    } catch (error) {
        console.error(
            "Invalid JSON cache:",
            error instanceof Error
                ? error.message
                : "Unknown error"
        );

        await deleteCache(key);

        return {
            hit: false,
            value: null,
        };
    }
};