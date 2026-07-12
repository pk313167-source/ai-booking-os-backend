import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  const status = err.status || 500;
  const message = err.message || "Something went wrong on the server";
  
  res.status(status).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};
