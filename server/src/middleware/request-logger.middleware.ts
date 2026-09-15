import {
    Request,
    Response,
    NextFunction,
} from "express";

export const requestLoggerMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startTime = Date.now();

    res.on("finish", () => {
        const duration =
            Date.now() - startTime;

        console.log(
            `[${req.requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
        );
    });

    next();
};