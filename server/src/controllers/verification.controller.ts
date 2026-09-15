import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    verifyProduct,
} from "../services/verification.service.js";

export const verifyProductController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const productId = Number(
            req.params.productId
        );

        if (
            !Number.isInteger(productId) ||
            productId <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_PRODUCT_ID",
                    message: "Invalid product ID",
                },
            });
        }

        const result =
            await verifyProduct(productId);

        return res.status(200).json({
            data: {
                productId,
                verification: result,
            },
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === "PRODUCT_NOT_FOUND"
        ) {
            return res.status(404).json({
                error: {
                    code: "PRODUCT_NOT_FOUND",
                    message: "Product not found",
                },
            });
        }

        next(error);
    }
};