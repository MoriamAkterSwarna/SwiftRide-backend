import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validateRequest =
  (zodSchema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      req.body = JSON.parse(req.body.data) || req.body;
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
