import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err?.stack || err?.message || err);
  
  const status = err?.status || err?.statusCode || 500;
  const message = err?.message || "Something went wrong on the server";
  
  // Don't send stack traces in production
  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err?.stack }),
  });
};
