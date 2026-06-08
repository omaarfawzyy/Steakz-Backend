import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export const app = express();

app.use(cors());
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
