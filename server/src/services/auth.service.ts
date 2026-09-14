import { Prisma } from "../generated/prisma/client.js";

import {
    findUserByEmail,
    createUser,
} from "../repositories/user.repository.js";

import {
    hashPassword,
    comparePassword,
} from "./password.service.js";

import {
    generateAccessToken,
} from "./token.service.js";

import { AppError } from "../utils/app-error.js";

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
        generateAccessToken(user.id);

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

    if (!user) {
        throw new AppError(
            401,
            "INVALID_CREDENTIALS",
            "Invalid email or password"
        );
    }

    const passwordValid =
        await comparePassword(
            data.password,
            user.passwordHash
        );

    if (!passwordValid) {
        throw new AppError(
            401,
            "INVALID_CREDENTIALS",
            "Invalid email or password"
        );
    }

    const accessToken =
        generateAccessToken(user.id);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        accessToken,
    };
};