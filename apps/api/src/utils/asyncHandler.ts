import { Request, Response, NextFunction, RequestHandler } from "express";
import { ApiError } from "./apiError";

const asyncHandler =
  (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
  ): RequestHandler =>
  async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error: unknown) {
      const err = error as ApiError;
      const isApiError = error instanceof ApiError;
      const statusCode: number = err?.statusCode ?? 500;
      const rawMessage = err?.message || "Internal Server Error";

      // Mask raw database errors from leaking to the client
      const isInternalDatabaseError =
        statusCode >= 500 ||
        !isApiError ||
        rawMessage.includes("invocation") ||
        rawMessage.includes("PrismaClient") ||
        rawMessage.includes("Unknown field");

      const clientMessage = isInternalDatabaseError
        ? "An internal server error occurred. Please try again."
        : rawMessage;

      if (process.env.NODE_ENV !== "test") {
        console.error("[API Error]", error);
      }

      res.status(statusCode).json({
        success: false,
        message: clientMessage,
        errors: err?.errors || [],
        data: err?.data || null,
      });
    }
  };

export { asyncHandler };
