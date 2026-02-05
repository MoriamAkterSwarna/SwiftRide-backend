import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { IsActive, IUser, Role } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";
import AppError from "../ErrorHelpers/appError";
import  httpStatus  from 'http-status-codes';


export const createUserTokens = (user:Partial<IUser>) => {

    const jwtPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(
      jwtPayload,
      envVars.JWT_ACCESS_SECRET,
      envVars.JWT_ACCESS_EXPIRATION
    );

    const refreshToken = generateToken(
      jwtPayload,
      envVars.JWT_REFRESH_SECRET,
      envVars.JWT_REFRESH_EXPIRATION
    );

    return {
        accessToken,
        refreshToken,
    }
}

export const createNewAccessTokenWithRefreshToken = async(refreshToken: string) => {

    const verifyRefreshToken = verifyToken(
      refreshToken,
      envVars.JWT_REFRESH_SECRET
    ) as JwtPayload;

    if (!verifyRefreshToken) {
      throw new Error("Invalid refresh token");
    }

    const isUserExist = await User.findOne({ email: verifyRefreshToken.email });

    if (!isUserExist) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
    }

    // Super admins cannot be blocked
    if (
      isUserExist.role !== Role.SUPER_ADMIN &&
      (isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE)
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `User is ${isUserExist.isActive}`
      );
    }

    if (isUserExist.isDeleted) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted");
    }

    const jwtPayload = {
      userId: isUserExist._id,
      email: isUserExist.email,
      role: isUserExist.role,
    };

    const accessToken = generateToken(
      jwtPayload,
      envVars.JWT_ACCESS_SECRET,
      envVars.JWT_ACCESS_EXPIRATION
    );

    return {
      accessToken,
    };

}