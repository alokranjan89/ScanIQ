import jwt from "jsonwebtoken";

import { authConfig } from "../config/auth.js";

export interface AccessTokenPayload {
    userId: number;
}

export const generateAccessToken = (
    userId: number
): string => {
    return jwt.sign(
        {
            userId,
        },
        authConfig.jwtSecret,
        {
            expiresIn:
                authConfig.accessTokenExpiresIn,
        }
    );
};

export const verifyAccessToken = (
    token: string
): AccessTokenPayload => {
    const decoded =
        jwt.verify(
            token,
            authConfig.jwtSecret
        );

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "number"
    ) {
        throw new Error(
            "Invalid access token payload"
        );
    }

    return {
        userId: decoded.userId,
    };
};