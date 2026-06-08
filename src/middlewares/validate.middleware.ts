import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";

export const validate =
  (schema: ZodTypeAny) =>
  async (request: Request, _response: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: request.body,
        params: request.params,
        query: request.query
      });
      next();
    } catch (error) {
      next(error);
    }
  };

