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