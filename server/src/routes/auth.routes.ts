import { Router } from "express";

import {
    register,
    login,
    logout,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    removeAccount,
    changePassword,
} from "../controllers/auth.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    deleteAccountSchema,
    changePasswordSchema,
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
    "/forgot-password",
    authRateLimiter,
    validate(
        forgotPasswordSchema,
        "INVALID_FORGOT_PASSWORD_REQUEST",
        "Invalid password reset request",
    ),
    forgotPassword,
);

router.post(
    "/reset-password",
    authRateLimiter,
    validate(
        resetPasswordSchema,
        "INVALID_RESET_PASSWORD_REQUEST",
        "Invalid password reset request",
    ),
    resetPassword,
);

router.post(
    "/logout",
    requireAuth,
    logout
);

router.get(
    "/me",
    requireAuth,
    getCurrentUser
);

router.delete(
    "/me",
    requireAuth,
    authRateLimiter,
    validate(
        deleteAccountSchema,
        "INVALID_ACCOUNT_DELETION_REQUEST",
        "A valid password is required to delete your account",
    ),
    removeAccount,
);

router.patch(
    "/me/password",
    requireAuth,
    authRateLimiter,
    validate(
        changePasswordSchema,
        "INVALID_PASSWORD_CHANGE_REQUEST",
        "Both your current and new password are required",
    ),
    changePassword,
);

export default router;
