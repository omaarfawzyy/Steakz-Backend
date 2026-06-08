import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

export const notFoundHandler = (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  next(new AppError(404, `Route not found: ${request.method} ${request.originalUrl}`));
};

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      message: "Validation failed.",
      details: error.flatten()
    });
  }

  console.error(error);

  return response.status(500).json({
    success: false,
    message: "Internal server error."
  });
};

