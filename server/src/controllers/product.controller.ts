import { Request, Response, NextFunction } from "express";
import { getProductByBarcode } from "../services/product.service.js";
import { refreshProductByBarcode } from "../services/product-refresh.service.js";
import { findProductById } from "../repositories/product.repository.js";
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

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const rawProductId = req.params.productId;

        const productIdString = Array.isArray(rawProductId)
            ? rawProductId[0]
            : rawProductId;

        const productId = Number(productIdString);

        if (!Number.isInteger(productId) || productId <= 0) {
            throw new AppError(
                400,
                "INVALID_PRODUCT_ID",
                "Invalid product ID"
            );
        }

        const product = await findProductById(productId);

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

export const refreshProduct = async (
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

        const product = await refreshProductByBarcode(
            normalizedBarcode
        );

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