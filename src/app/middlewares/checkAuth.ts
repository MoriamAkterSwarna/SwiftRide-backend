import { NextFunction, Request, Response } from "express";
import AppError from "../ErrorHelpers/appError";
import httpStatus from "http-status-codes";
import { verifyToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

import { envVars } from "../config/env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let accessToken = req.headers.authorization || req.cookies?.accessToken;
      console.log("Authorization Header:", req.headers.authorization);
      console.log("Cookie accessToken:", req.cookies?.accessToken);
      console.log("All Cookies:", req.cookies);

      if (!accessToken) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized to access this route",
        );
      }

      // Remove "Bearer " prefix if present (from Authorization header)
      if (typeof accessToken === "string" && accessToken.startsWith("Bearer ")) {
        accessToken = accessToken.slice(7);
      }

      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET,
      ) as JwtPayload;

      if (!verifiedToken) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not authorized to access this route",
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

      // Super admins cannot be blocked
      const userRole = isUserExist.role ?? (verifiedToken as JwtPayload).role;
      if (
        userRole !== Role.SUPER_ADMIN &&
        (isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE)
      ) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          `User is ${isUserExist.isActive}`,
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted");
      }

      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.UNAUTHORIZED, "User is not verified");
      }

      if (userRole !== Role.SUPER_ADMIN && !authRoles.includes(userRole)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You do not have permission to access this route",
        );
      }

      req.user = {
        ...verifiedToken,
        role: userRole,
      } as JwtPayload;

      next();
    } catch (err) {
      next(err);
    }
  };
