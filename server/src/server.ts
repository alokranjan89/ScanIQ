import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";
import redis from "./config/redis.js";

const server = app.listen(env.port, () => {
    console.log(`ScanIQ server running on port ${env.port}`);
});

const shutdown = async () => {
    console.log("Shutting down ScanIQ server...");

    server.close(async () => {
        await prisma.$disconnect();
        await redis.quit();

        console.log("Database disconnected");
        console.log("Redis disconnected");

        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);