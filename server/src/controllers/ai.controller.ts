import {
  Request,
  Response,
  NextFunction,
} from "express";

import { explainProduct } from "../services/ai.service.js";
import { findProductById } from "../repositories/product.repository.js";
export const explainProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const productId = Number(req.body.productId);

    const product = await findProductById(productId);

    if (!product) {
      return res.status(404).json({
        error: {
          code: "PRODUCT_NOT_FOUND",
          message: "Product not found",
        },
      });
    }

    const explanation = await explainProduct({
      name: product.name,
      brand: product.brand,
      category: product.category,
      description: product.description,
      manufacturer: product.manufacturer,
      country: product.country,
      barcode: product.barcode,
      modelNumber: product.modelNumber,

      ingredients: product.ingredients.map(
        (ingredient) => ({
          name: ingredient.name,
          description: ingredient.description,
        })
      ),

      nutrition: product.nutrition
        ? {
            calories: product.nutrition.calories,
            protein: product.nutrition.protein,
            carbohydrates:
              product.nutrition.carbohydrates,
            fat: product.nutrition.fat,
            saturatedFat:
              product.nutrition.saturatedFat,
            sugars: product.nutrition.sugars,
            fiber: product.nutrition.fiber,
            salt: product.nutrition.salt,
            sodium: product.nutrition.sodium,
            unit: product.nutrition.unit,
          }
        : null,
    });

    return res.status(200).json({
      data: {
        productId: product.id,
        explanation,
      },
    });
  } catch (error) {
    next(error);
  }
};