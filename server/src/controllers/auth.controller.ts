import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    registerUser,
    loginUser,
} from "../services/auth.service.js";

import {
    findUserById,
} from "../repositories/user.repository.js";

import {
    AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import { AppError } from "../utils/app-error.js";

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result =
            await registerUser(req.body);

        return res.status(201).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const result =
            await loginUser(req.body);

        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getCurrentUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authenticatedRequest =
            req as AuthenticatedRequest;

        const user =
            await findUserById(
                authenticatedRequest.user.id
            );

        if (!user) {
            throw new AppError(
                401,
                "UNAUTHORIZED",
                "Authentication required"
            );
        }

        return res.status(200).json({
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    return res.status(200).json({
        data: {
            success: true,
            message: "Logged out successfully",
        },
    });
};