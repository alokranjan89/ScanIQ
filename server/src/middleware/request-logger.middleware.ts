import { Request, Response, NextFunction } from "express";

export const requestLoggerMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startTime = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const requestId = req.headers["x-request-id"];

        console.log(
            `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
        );
    });

    next();
};