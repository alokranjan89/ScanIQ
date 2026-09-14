import express from "express";
import healthRoutes from "./routes/health.routes.js";
import productRoutes from "./routes/product.routes.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());

app.use(healthRoutes);
app.use("/api/v1/products", productRoutes);

// 404 handler — must come after all routes
app.use(notFoundMiddleware);

// Error handler — must be the last middleware
app.use(errorMiddleware);

export default app;