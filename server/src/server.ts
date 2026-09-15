import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";
import redis from "./config/redis.js";

const server = app.listen(env.port, () => {
    console.log(
        `ScanIQ server running on port ${env.port}`
    );
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
    if (isShuttingDown) {
        console.log(
            `Shutdown already in progress. Ignoring ${signal}.`
        );
        return;
    }

    isShuttingDown = true;

    console.log(
        `Received ${signal}. Shutting down ScanIQ server...`
    );

    server.close(async (serverError) => {
        if (serverError) {
            console.error(
                "Failed to close HTTP server:",
                serverError
            );

            process.exit(1);
        }

        try {
            await prisma.$disconnect();
            console.log("Database disconnected");
        } catch (error) {
            console.error(
                "Failed to disconnect database:",
                error
            );
        }

        try {
            await redis.quit();
            console.log("Redis disconnected");
        } catch (error) {
            console.error(
                "Failed to disconnect Redis:",
                error
            );
        }

        console.log("ScanIQ server shutdown complete.");

        process.exit(0);
    });
};

process.on("SIGINT", () => {
    void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
});