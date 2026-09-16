import rateLimit from "express-rate-limit";

export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
        },
    },
});

export const productLookupRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        error: {
            code: "PRODUCT_LOOKUP_RATE_LIMIT_EXCEEDED",
            message: "Too many product lookups. Please try again later.",
        },
    },
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        error: {
            code: "AUTH_RATE_LIMIT_EXCEEDED",
            message: "Too many authentication attempts. Please try again later.",
        },
    },
});

export const aiRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        error: {
            code: "AI_RATE_LIMIT_EXCEEDED",
            message: "Too many AI requests. Please try again later.",
        },
    },
});