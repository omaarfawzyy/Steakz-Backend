import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export const app = express();

const allowedOrigins = new Set(["http://localhost:5173", env.FRONTEND_URL].filter(Boolean));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    }
  })
);
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "Steakz backend is running."
  });
});

app.use("/api/v1", routes);
app.use(notFoundHandler);
app.use(errorHandler);
