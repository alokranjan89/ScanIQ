import "dotenv/config";

const portValue = process.env.PORT ?? "5000";
const port = Number(portValue);

if (
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
) {
    throw new Error(
        "PORT must be a valid port number"
    );
}

const databaseUrl =
    process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error(
        "DATABASE_URL is not configured"
    );
}

const redisUrl =
    process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error(
        "REDIS_URL is not configured"
    );
}

const clientUrl =
    process.env.CLIENT_URL;

if (!clientUrl) {
    throw new Error(
        "CLIENT_URL is not configured"
    );
}

export const env = {
    port,
    databaseUrl,
    redisUrl,
    clientUrl,
};