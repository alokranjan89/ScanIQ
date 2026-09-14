import prisma from "../config/prisma.js";

export const searchProducts = async (
  query: string,
  limit: number
) => {
  return prisma.product.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          brand: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          barcode: {
            contains: query,
            mode: "insensitive",
          },
        },
        {
          modelNumber: {
            contains: query,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      name: "asc",
    },
    take: limit,
  });
};