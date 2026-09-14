import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import productRoutes from "./routes/product.routes.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { requestIdMiddleware } from "./middleware/request-id.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware.js";
import { apiRateLimiter } from "./middleware/rate-limit.middleware.js";

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
    cors({
       origin: env.clientUrl,
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);
app.use(apiRateLimiter);


app.use("/api/v1", healthRoutes);
app.use("/api/v1/products", productRoutes);


app.use(notFoundMiddleware);


app.use(errorMiddleware);

export default app;