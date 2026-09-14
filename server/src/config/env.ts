import "dotenv/config";

const port = Number(process.env.PORT) || 5000;

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error("REDIS_URL is not configured");
}

export const env = {
    port,
    redisUrl,
};