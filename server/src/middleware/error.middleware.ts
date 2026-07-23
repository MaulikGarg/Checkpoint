import { Request, Response, NextFunction } from "express";
// imported as MongooseError to avoid type conflicts
import { Error as MongooseError } from "mongoose";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);
  switch (err.name) {
    case "CastError":
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    case "ValidationError": {
      const validationErr = err as MongooseError.ValidationError;
      const messages = Object.values(validationErr.errors).map(
        (e) => e.message,
      );
      return res.status(400).json({
        success: false,
        message: messages.join(" "),
      });
    }
    case "EmailError":
      return res.status(502).json({
        success: false,
        message: err.message,
      });
    default:
      return res.status(500).json({
        success: false,
        message: err.message || `Server error: ${err.name}`,
      });
  }
};
