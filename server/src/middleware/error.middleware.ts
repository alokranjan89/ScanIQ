import {
    Request,
    Response,
} from "express";

import { AppError } from "../utils/app-error.js";

export const errorMiddleware = (
    error: unknown,
    _req: Request,
    res: Response
) => {
    console.error(
        "Unhandled error:",
        error
    );

    if (
        error instanceof SyntaxError &&
        typeof error === "object" &&
        error !== null &&
        "type" in error &&
        error.type === "entity.parse.failed"
    ) {
        return res.status(400).json({
            error: {
                code: "INVALID_JSON",
                message: "Invalid JSON request body",
            },
        });
    }

    if (error instanceof AppError) {
        return res.status(
            error.statusCode
        ).json({
            error: {
                code: error.code,
                message: error.message,
            },
        });
    }

    return res.status(500).json({
        error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong",
        },
    });
};