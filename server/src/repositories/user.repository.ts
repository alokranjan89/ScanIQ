import prisma from "../config/prisma.js";

export const findUserByEmail = async (
    email: string
) => {
    return prisma.user.findUnique({
        where: {
            email,
        },
    });
};

export const findUserById = async (
    userId: number
) => {
    return prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
};

export const createUser = async (data: {
    email: string;
    passwordHash: string;
    name?: string;
}) => {
    return prisma.user.create({
        data: {
            email: data.email,
            passwordHash: data.passwordHash,
            name: data.name,
        },
    });
};

export const deleteUserById = async (userId: number) => {
    return prisma.user.delete({
        where: { id: userId },
    });
};

export const updateUserPassword = async (
    userId: number,
    passwordHash: string,
) => {
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { id: userId },
            data: { passwordHash, tokenVersion: { increment: 1 } },
        });
        await tx.passwordResetToken.deleteMany({ where: { userId } });
        return user;
    });
};
