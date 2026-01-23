import { NextFunction, Request, Response } from "express";
import AppError from "../ErrorHelpers/appError";
import  httpStatus  from 'http-status-codes';
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";


export const checkAuth= (...authRoles: string[]) =>async (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization || req.cookies.accessToken; 
    console.log(accessToken)

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

     const isUserExist = await User.findOne({ email: verifiedToken.email });

    if (!isUserExist) {
          throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
        }
    
        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          throw new AppError(
            httpStatus.UNAUTHORIZED,
            `User is ${isUserExist.isActive}`
          );
        }
    
        if (isUserExist.isDeleted) {
          throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted");
        }

        if( !isUserExist.isVerified){
          throw new AppError(httpStatus.UNAUTHORIZED, "User is not verified");
        }

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


