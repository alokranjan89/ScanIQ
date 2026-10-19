import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

export const assertPasswordResetEmailConfigured = (): void => {
    if (!resendApiKey || !resendFromEmail) {
        throw new AppError(
            503,
            "PASSWORD_RESET_UNAVAILABLE",
            "Password reset email is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server.",
        );
    }
};

export const sendPasswordResetEmail = async (
    email: string,
    token: string,
): Promise<void> => {
    assertPasswordResetEmailConfigured();

    const resetUrl = new URL("/reset-password", env.clientUrl);
    resetUrl.searchParams.set("token", token);

    const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(10_000),
        body: JSON.stringify({
            from: resendFromEmail,
            to: [email],
            subject: "Reset your ScanIQ password",
            text: `Use this link to reset your ScanIQ password. It expires in 30 minutes.\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
        }),
    });

    if (!response.ok) {
        throw new AppError(
            503,
            "PASSWORD_RESET_EMAIL_FAILED",
            "Unable to send a password reset email right now",
        );
    }
};
