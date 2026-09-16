import { Router } from "express";

import {
    register,
    login,
    logout,
    getCurrentUser,
} from "../controllers/auth.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {
    registerSchema,
    loginSchema,
} from "../validators/auth.validator.js";

import {
    requireAuth,
} from "../middleware/auth.middleware.js";

import {
    authRateLimiter,
} from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post(
    "/register",
    authRateLimiter,
    validate(
        registerSchema,
        "INVALID_REGISTRATION_DATA",
        "Invalid registration data"
    ),
    register
);

router.post(
    "/login",
    authRateLimiter,
    validate(
        loginSchema,
        "INVALID_LOGIN_DATA",
        "Invalid login data"
    ),
    login
);

router.post(
    "/logout",
    logout
);

router.get(
    "/me",
    requireAuth,
    getCurrentUser
);

export default router;