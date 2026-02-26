// src/middleware/error.middleware.ts

import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === "production";

  console.error(`[Error] ${statusCode} — ${err.message}`, {
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(statusCode).json({
    success: false,
    message: err.isOperational
      ? err.message
      : isProduction
        ? "An unexpected error occurred. Please try again later."
        : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};