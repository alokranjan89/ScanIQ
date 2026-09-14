import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  searchProductCatalog,
} from "../services/search.service.js";

export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = String(req.query.q);
    const limit = Number(req.query.limit ?? 20);

    const products =
      await searchProductCatalog(
        query,
        limit
      );

    return res.status(200).json({
      data: {
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};