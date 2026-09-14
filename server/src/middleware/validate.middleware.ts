import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validate = (
    schema: z.ZodType,
    errorCode = "VALIDATION_ERROR",
    errorMessage = "Invalid request data"
) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });

        if (!result.success) {
            return res.status(400).json({
                error: {
                    code: errorCode,
                    message: errorMessage,
                    details: result.error.issues.map(
                        (issue) => ({
                            path: issue.path,
                            message: issue.message,
                        })
                    ),
                },
            });
        }

        next();
    };
};