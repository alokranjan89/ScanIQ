import prisma from "../config/prisma.js";

export const replacePasswordResetToken = async (
    userId: number,
    tokenHash: string,
    expiresAt: Date,
) => {
    return prisma.$transaction(async (tx) => {
        await tx.passwordResetToken.deleteMany({ where: { userId } });
        return tx.passwordResetToken.create({
            data: { userId, tokenHash, expiresAt },
        });
    });
};

export const removePasswordResetToken = async (tokenHash: string) => {
    return prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
};

export const consumePasswordResetToken = async (
    tokenHash: string,
    passwordHash: string,
    now = new Date(),
): Promise<boolean> => {
    return prisma.$transaction(async (tx) => {
        const token = await tx.passwordResetToken.findUnique({
            where: { tokenHash },
        });

        if (!token || token.expiresAt <= now) {
            return false;
        }

        const consumed = await tx.passwordResetToken.deleteMany({
            where: { tokenHash, userId: token.userId, expiresAt: { gt: now } },
        });

        if (consumed.count !== 1) {
            return false;
        }

        await tx.user.update({
            where: { id: token.userId },
            data: { passwordHash, tokenVersion: { increment: 1 } },
        });

        await tx.passwordResetToken.deleteMany({
            where: { userId: token.userId },
        });

        return true;
    });
};
