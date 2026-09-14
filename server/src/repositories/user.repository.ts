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