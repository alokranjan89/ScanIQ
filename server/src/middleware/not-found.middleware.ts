import { Request, Response } from "express";

export const notFoundMiddleware = (
    _req: Request,
    res: Response
) => {
    return res.status(404).json({
        error: {
            code: "ROUTE_NOT_FOUND",
            message: "The requested endpoint was not found",
        },
    });
};