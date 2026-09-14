import prisma from "../config/prisma.js";

export const createScan = async (data: {
  userId: number;
  productId: number;
  scannedCode: string;
}) => {
  return prisma.scan.create({
    data: {
      userId: data.userId,
      productId: data.productId,
      scannedCode: data.scannedCode,
    },
  });
};

export const findScansByUserId = async (
  userId: number,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  const [scans, total] = await Promise.all([
    prisma.scan.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.scan.count({
      where: {
        userId,
      },
    }),
  ]);

  return {
    scans,
    total,
  };
};
export const deleteScanByIdAndUserId = async (
  scanId: number,
  userId: number
) => {
  return prisma.scan.deleteMany({
    where: {
      id: scanId,
      userId,
    },
  });
};