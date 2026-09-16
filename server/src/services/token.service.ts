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