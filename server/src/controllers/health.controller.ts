import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import redis from "../config/redis.js";

export const healthCheck = async (
    _req: Request,
    res: Response
) => {
    let databaseStatus = "ok";
    let redisStatus = "ok";

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        databaseStatus = "error";
    }

    try {
        const pingResult = await redis.ping();
        if (pingResult !== "PONG") {
            redisStatus = "error";
        }
    } catch {
        redisStatus = "error";
    }

    const isDbHealthy = databaseStatus === "ok";
    const statusCode = isDbHealthy ? 200 : 503;

    res.status(statusCode).json({
        status: isDbHealthy
            ? redisStatus === "ok"
                ? "ok"
                : "degraded"
            : "error",
        services: {
            database: databaseStatus,
            redis: redisStatus,
        },
    });
};