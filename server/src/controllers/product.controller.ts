import { Request, Response } from "express";
import { getProductByBarcode } from "../services/product.service.js";
import { isValidBarcode } from "../validators/barcode.validator.js";

export const getProduct = async (
    req: Request,
    res: Response
) => {
    try {
        const { barcode } = req.params;

        if (typeof barcode !== "string") {
            return res.status(400).json({
                error: {
                    code: "INVALID_BARCODE",
                    message: "Barcode must be a single value",
                },
            });
        }

        if (!isValidBarcode(barcode)) {
            return res.status(400).json({
                error: {
                    code: "INVALID_BARCODE",
                    message: "Invalid barcode",
                },
            });
        }

        const product = await getProductByBarcode(barcode);

        if (!product) {
            return res.status(404).json({
                error: {
                    code: "PRODUCT_NOT_FOUND",
                    message: "Product not found",
                },
            });
        }

        return res.status(200).json({
            data: product,
        });
    } catch (error) {
        console.error("Failed to get product:", error);

        return res.status(500).json({
            error: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Something went wrong",
            },
        });
    }
};