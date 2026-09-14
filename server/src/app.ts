import express from "express";
import healthRoutes from "./routes/health.routes.js";
import productRoutes from "./routes/product.routes.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware.js";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.use(healthRoutes);
app.use("/api/v1/products", productRoutes);


app.use(notFoundMiddleware);


app.use(errorMiddleware);

export default app;