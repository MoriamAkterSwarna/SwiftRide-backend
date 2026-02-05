/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";


export const validateRequest =
  (zodSchema: any) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }

      // Validate with body wrapper to support schemas that expect { body: { ... } }
      const validated = await zodSchema.parseAsync({ body: req.body });
      
      // Extract body back to req.body if it exists
      if (validated.body) {
        req.body = validated.body;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
