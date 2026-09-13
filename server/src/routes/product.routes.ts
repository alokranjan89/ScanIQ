import { Router } from "express";
import { getProduct } from "../controllers/product.controller.js";

const router = Router();

router.get("/barcode/:barcode", getProduct);

export default router;