import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import redis from "../config/redis.js";

export const healthCheck = async (
    _req: Request,
    res: Response
) => {
    let databaseStatus = "ok";
    let redisStatus = "ok";
    let isHealthy = true;

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch {
        databaseStatus = "error";
        isHealthy = false;
    }

    try {
        const pingResult = await redis.ping();
        if (pingResult !== "PONG") {
            redisStatus = "error";
            isHealthy = false;
        }
    } catch {
        redisStatus = "error";
        isHealthy = false;
    }

    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
        status: isHealthy ? "ok" : "degraded",
        services: {
            database: databaseStatus,
            redis: redisStatus,
        },
    });
};