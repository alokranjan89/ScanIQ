import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    findProductById,
} from "../repositories/product.repository.js";

export const compareProductsController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const productId1 = Number(
            req.query.productId1,
        );

        const productId2 = Number(
            req.query.productId2,
        );

        if (
            !Number.isInteger(productId1) ||
            productId1 <= 0 ||
            !Number.isInteger(productId2) ||
            productId2 <= 0
        ) {
            return res.status(400).json({
                error: {
                    code: "INVALID_COMPARISON_REQUEST",
                    message:
                        "Product IDs must be positive integers.",
                },
            });
        }

        if (productId1 === productId2) {
            return res.status(400).json({
                error: {
                    code: "SAME_PRODUCT_COMPARISON",
                    message:
                        "Please select two different products.",
                },
            });
        }

        const [
            product1,
            product2,
        ] = await Promise.all([
            findProductById(productId1),
            findProductById(productId2),
        ]);

        if (!product1 || !product2) {
            return res.status(404).json({
                error: {
                    code: "PRODUCT_NOT_FOUND",
                    message:
                        "One or both products could not be found.",
                },
            });
        }

        return res.status(200).json({
            data: {
                products: [
                    product1,
                    product2,
                ],
            },
        });
    } catch (error) {
        next(error);
    }
};