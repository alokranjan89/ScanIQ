import { Request, Response, NextFunction } from "express";
import { getProductByBarcode } from "../services/product.service.js";
import { AppError } from "../utils/app-error.js";

export const getProduct = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rawBarcode = req.params.barcode;
        const barcode = Array.isArray(rawBarcode)
            ? rawBarcode[0]
            : rawBarcode;
        const normalizedBarcode = barcode.trim();

        const product = await getProductByBarcode(normalizedBarcode);

        if (!product) {
            throw new AppError(
                404,
                "PRODUCT_NOT_FOUND",
                "Product not found"
            );
        }

        return res.status(200).json({
            data: product,
        });
    } catch (error) {
        next(error);
    }
};