const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error(
        "JWT_SECRET is not configured"
    );
}

if (jwtSecret.length < 32) {
    throw new Error(
        "JWT_SECRET must be at least 32 characters long"
    );
}

export const authConfig = {
    jwtSecret,
    accessTokenExpiresIn: "7d",
} as const;