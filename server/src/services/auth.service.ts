import { Prisma } from "../generated/prisma/client.js";
import { createHash, randomBytes } from "node:crypto";

import {
    findUserByEmail,
    findUserById,
    createUser,
    deleteUserById,
    updateUserPassword,
} from "../repositories/user.repository.js";
import {
    consumePasswordResetToken,
    removePasswordResetToken,
    replacePasswordResetToken,
} from "../repositories/password-reset.repository.js";

import {
    hashPassword,
    comparePassword,
} from "./password.service.js";

import {
    generateAccessToken,
} from "./token.service.js";

import { AppError } from "../utils/app-error.js";
import {
    assertPasswordResetEmailConfigured,
    sendPasswordResetEmail,
} from "./password-reset-email.service.js";

const hashResetToken = (token: string): string =>
    createHash("sha256").update(token).digest("hex");

const DUMMY_PASSWORD_HASH =
    "$2b$12$5UncWrMrM6TXvTYQoblmGO3iy0D/GQuaAeT7zyJG9tmG1cDJC981m";
const PASSWORD_RESET_MIN_RESPONSE_MS = 300;

const normalizeEmail = (
    email: string
): string => {
    return email.trim().toLowerCase();
};

export const registerUser = async (data: {
    email: string;
    password: string;
    name?: string;
}) => {
    const email =
        normalizeEmail(data.email);

    const existingUser =
        await findUserByEmail(email);

    if (existingUser) {
        throw new AppError(
            409,
            "EMAIL_ALREADY_EXISTS",
            "An account with this email already exists"
        );
    }

    const passwordHash =
        await hashPassword(data.password);

    let user;

    try {
        user = await createUser({
            email,
            passwordHash,
            name: data.name?.trim() || undefined,
        });
    } catch (error) {
        if (
            error instanceof
                Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new AppError(
                409,
                "EMAIL_ALREADY_EXISTS",
                "An account with this email already exists"
            );
        }

        throw error;
    }

    const accessToken =
        generateAccessToken(user.id, user.tokenVersion);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        accessToken,
    };
};

export const loginUser = async (data: {
    email: string;
    password: string;
}) => {
    const email =
        normalizeEmail(data.email);

    const user =
        await findUserByEmail(email);

    const passwordValid = await comparePassword(
        data.password,
        user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    );

    if (!user || !passwordValid) {
        throw new AppError(
            401,
            "INVALID_CREDENTIALS",
            "Invalid email or password"
        );
    }

    const accessToken =
        generateAccessToken(user.id, user.tokenVersion);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        accessToken,
    };
};

export const requestPasswordReset = async (emailInput: string): Promise<void> => {
    assertPasswordResetEmailConfigured();

    const startedAt = Date.now();
    const user = await findUserByEmail(normalizeEmail(emailInput));

    if (user) {
        const token = randomBytes(32).toString("base64url");
        const tokenHash = hashResetToken(token);

        await replacePasswordResetToken(
            user.id,
            tokenHash,
            new Date(Date.now() + 30 * 60 * 1000),
        );

        void sendPasswordResetEmail(user.email, token).catch(async (error) => {
            console.error(
                "Password reset email delivery failed:",
                error instanceof Error ? error.message : "Unknown email provider error",
            );

            try {
                await removePasswordResetToken(tokenHash);
            } catch (cleanupError) {
                console.error("Failed to remove undelivered password reset token:", cleanupError);
            }
        });
    }

    const remainingDelay = PASSWORD_RESET_MIN_RESPONSE_MS - (Date.now() - startedAt);
    if (remainingDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, remainingDelay));
    }
};

export const resetUserPassword = async (
    token: string,
    password: string,
): Promise<void> => {
    const passwordHash = await hashPassword(password);
    const reset = await consumePasswordResetToken(
        hashResetToken(token),
        passwordHash,
    );

    if (!reset) {
        throw new AppError(
            400,
            "INVALID_RESET_TOKEN",
            "This password reset link is invalid or expired",
        );
    }
};

export const deleteAccount = async (
    userId: number,
    password: string,
): Promise<void> => {
    const user = await findUserById(userId);

    if (!user) {
        throw new AppError(404, "USER_NOT_FOUND", "Account not found");
    }

    if (!(await comparePassword(password, user.passwordHash))) {
        throw new AppError(
            400,
            "INVALID_PASSWORD",
            "The password you entered is incorrect",
        );
    }

    await deleteUserById(userId);
};

export const changeUserPassword = async (
    userId: number,
    currentPassword: string,
    newPassword: string,
): Promise<string> => {
    const user = await findUserById(userId);
    if (!user || !(await comparePassword(currentPassword, user.passwordHash))) {
        throw new AppError(
            400,
            "INVALID_PASSWORD",
            "The current password is incorrect",
        );
    }

    const updatedUser = await updateUserPassword(
        userId,
        await hashPassword(newPassword),
    );
    return generateAccessToken(updatedUser.id, updatedUser.tokenVersion);
};
