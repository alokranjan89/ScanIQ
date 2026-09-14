import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    verifyAccessToken,
} from "../services/token.service.js";

import {
    findUserById,
} from "../repositories/user.repository.js";

import { AppError } from "../utils/app-error.js";

export interface AuthenticatedRequest
    extends Request {
    user: {
        id: number;
        email: string;
        name: string | null;
    };
}

export const requireAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const authorization =
            req.headers.authorization;

        if (!authorization) {
            throw new AppError(
                401,
                "UNAUTHORIZED",
                "Authentication required"
            );
        }

        const [scheme, token] =
            authorization.split(" ");

        if (
            scheme !== "Bearer" ||
            !token
        ) {
            throw new AppError(
                401,
                "UNAUTHORIZED",
                "Authentication required"
            );
        }

        const payload =
            verifyAccessToken(token);

        const user =
            await findUserById(
                payload.userId
            );

        if (!user) {
            throw new AppError(
                401,
                "UNAUTHORIZED",
                "Authentication required"
            );
        }

        (
            req as AuthenticatedRequest
        ).user = {
            id: user.id,
            email: user.email,
            name: user.name,
        };

        next();
    } catch (error) {
        if (
            error instanceof AppError
        ) {
            next(error);
            return;
        }

        next(
            new AppError(
                401,
                "UNAUTHORIZED",
                "Authentication required"
            )
        );
    }
};