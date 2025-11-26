/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthService } from "./auth.service";
import AppError from "../../ErrorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthService.credentialsLogin(req.body);

    // res.cookie('accessToken', loginInfo.accessToken, {
    //   httpOnly: true,
    //   secure: false, // Set to true if using HTTPS
    // });

    // res.cookie('refreshToken', loginInfo.refreshToken, {
    //   httpOnly: true,
    //   secure: false, // Set to true if using HTTPS

    // });

    setAuthCookie(res, loginInfo);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Logged in successfully",
      data: loginInfo,
    });
  }
);
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(httpStatus.BAD_REQUEST, "Refresh token is required");
    }

    // const refreshToken = req.headers.authorization;

    const tokenInfo = await AuthService.getNewAccessToken(
      refreshToken as string
    );

    // res.cookie("accessToken", tokenInfo.accessToken, {
    //   httpOnly: true,
    //   secure: false, // Set to true if using HTTPS
    // });

    setAuthCookie(res, tokenInfo.accessToken);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Access token refreshed successfully",
      data: tokenInfo,
    });
  }
);

const logoutUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User logged out successfully",
      data: null,
    });
  }
);

const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Old password and new password are required"
      );
    }

    const decodedToken = req.user;

    if (!decodedToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    await AuthService.resetPassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  }
);

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logoutUser,
  resetPassword,
};
