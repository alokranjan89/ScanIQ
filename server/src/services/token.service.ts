import jwt from "jsonwebtoken";

import { authConfig } from "../config/auth.js";

export interface AccessTokenPayload {
    userId: number;
    tokenVersion: number;
}

export const generateAccessToken = (
    userId: number,
    tokenVersion = 0,
): string => {
    return jwt.sign(
        {
            userId,
            tokenVersion,
        },
        authConfig.jwtSecret,
        {
            algorithm: "HS256",
            expiresIn:
                authConfig.accessTokenExpiresIn as jwt.SignOptions["expiresIn"],
        }
    );
};

export const verifyAccessToken = (
    token: string
): AccessTokenPayload => {
    const decoded =
        jwt.verify(
            token,
            authConfig.jwtSecret,
            {
                algorithms: ["HS256"],
            }
        );

    if (
        typeof decoded !== "object" ||
        decoded === null ||
        typeof decoded.userId !== "number" ||
        (decoded.tokenVersion !== undefined &&
            typeof decoded.tokenVersion !== "number")
    ) {
        throw new Error(
            "Invalid access token payload"
        );
    }

    return {
        userId: decoded.userId,
        tokenVersion: decoded.tokenVersion ?? 0,
    };
};
