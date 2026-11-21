import type {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import type { ZodType } from "zod";

import ApiError from "../utils/ApiError.js";

type ValidationTarget = "body" | "query" | "params";

const validate = (
  schema: ZodType,
  target: ValidationTarget = "body",
): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(
        new ApiError(
          422,
          "Validation failed. Please check your input.",
          result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        ),
      );

      return;
    }

    if (target === "body") {
      req.body = result.data;
    }

    next();
  };
};

export default validate;
