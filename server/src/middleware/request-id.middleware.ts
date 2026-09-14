import { randomUUID } from "crypto";
import { Request, Response, NextFunction } from "express";

export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const requestId = randomUUID();

    req.headers["x-request-id"] = requestId;
    res.setHeader("X-Request-ID", requestId);

    next();
};