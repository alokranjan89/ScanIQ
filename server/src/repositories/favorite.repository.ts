import prisma from "../config/prisma.js";

export const createFavorite = async (data: {
  userId: number;
  productId: number;
}) => {
  return prisma.favorite.create({
    data: {
      userId: data.userId,
      productId: data.productId,
    },
    include: {
      product: true,
    },
  });
};

export const findFavoritesByUserId = async (
  userId: number
) => {
  return prisma.favorite.findMany({
    where: {
      userId,
    },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findFavoriteByUserAndProduct = async (
  userId: number,
  productId: number
) => {
  return prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
};

export const deleteFavoriteByUserAndProduct = async (
  userId: number,
  productId: number
) => {
  return prisma.favorite.deleteMany({
    where: {
      userId,
      productId,
    },
  });
};