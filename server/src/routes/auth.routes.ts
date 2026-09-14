import { Router } from "express";

import {
    register,
    login,
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

const router = Router();

router.post(
    "/register",
    validate(
        registerSchema,
        "INVALID_REGISTRATION_DATA",
        "Invalid registration data"
    ),
    register
);

router.post(
    "/login",
    validate(
        loginSchema,
        "INVALID_LOGIN_DATA",
        "Invalid login data"
    ),
    login
);

router.get(
    "/me",
    requireAuth,
    getCurrentUser
);

export default router;