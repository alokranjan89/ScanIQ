import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    registerUser,
    loginUser,
    requestPasswordReset,
    resetUserPassword,
    deleteAccount,
    changeUserPassword,
} from "../services/auth.service.js";

import {
    findUserById,
    invalidateUserTokens,
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
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authenticatedRequest = req as AuthenticatedRequest;
        await invalidateUserTokens(authenticatedRequest.user.id);

        return res.status(200).json({
            data: {
                success: true,
                message: "Logged out successfully",
            },
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        await requestPasswordReset(req.body.email);
        return res.status(200).json({
            data: {
                message: "If an account exists for that email, a reset link has been sent.",
            },
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        await resetUserPassword(req.body.token, req.body.password);
        return res.status(200).json({ data: { success: true } });
    } catch (error) {
        next(error);
    }
};

export const removeAccount = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authenticatedRequest = req as AuthenticatedRequest;
        await deleteAccount(
            authenticatedRequest.user.id,
            req.body.password,
        );
        return res.status(200).json({ data: { success: true } });
    } catch (error) {
        next(error);
    }
};

export const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authenticatedRequest = req as AuthenticatedRequest;
        const accessToken = await changeUserPassword(
            authenticatedRequest.user.id,
            req.body.currentPassword,
            req.body.newPassword,
        );
        return res.status(200).json({ data: { success: true, accessToken } });
    } catch (error) {
        next(error);
    }
};
