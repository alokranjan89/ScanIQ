import app from "./app.js";
import { env } from "./config/env.js";
import prisma from "./config/prisma.js";

const server = app.listen(env.port, () => {
    console.log(`ScanIQ server running on port ${env.port}`);
});

const shutdown = async () => {
    console.log("Shutting down ScanIQ server...");

    server.close(async () => {
        await prisma.$disconnect();

        console.log("Database disconnected");
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);