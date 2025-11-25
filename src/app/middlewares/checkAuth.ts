import { NextFunction, Request, Response } from "express";
import AppError from "../ErrorHelpers/appError";
import  httpStatus  from 'http-status-codes';
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

import { envVars } from "../config/env";

export const checkAuth= (...authRoles: string[]) =>async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized to access this route"
      );
    }

    const verifiedToken = verifyToken(
      accessToken,
      envVars.JWT_ACCESS_SECRET
    ) as JwtPayload;

    if (!verifiedToken) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized to access this route"
      );
    }

    // if ((verifiedToken as JwtPayload).role !== Role.ADMIN) {
    //   throw new AppError(
    //     httpStatus.FORBIDDEN,
    //     "You do not have permission to access this route"
    //   );
    // } 

    if(!authRoles.includes((verifiedToken as JwtPayload).role)){
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to access this route"
      );
    }

    req.user = verifiedToken ;

    next();
  } catch (err) {
    next(err);
  }
};