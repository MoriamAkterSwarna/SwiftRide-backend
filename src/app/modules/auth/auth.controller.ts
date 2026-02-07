/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthService } from "./auth.service";
import AppError from "../../ErrorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";
import passport from "passport";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const loginInfo = await AuthService.credentialsLogin(req.body);

    // res.cookie('accessToken', loginInfo.accessToken, {
    //   httpOnly: true,
    //   secure: false, // Set to true if using HTTPS
    // });

    // res.cookie('refreshToken', loginInfo.refreshToken, {
    //   httpOnly: true,
    //   secure: false, // Set to true if using HTTPS

    // });

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(
          new AppError(
            err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
            err.message,
          ),
        );
      }

      if (!user) {
        return next(
          new AppError(
            httpStatus.UNAUTHORIZED,
            info?.message || "Unauthorized",
          ),
        );
      }

      const userTokens = createUserTokens(user);

      // delete user.toObject().password;
      const { password: pass, ...rest } = user.toObject();

      setAuthCookie(res, userTokens);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Logged in successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
          redirectUrl: "/home",
        },
      });
    })(req, res, next);

    // setAuthCookie(res, loginInfo);

    // sendResponse(res, {
    //   statusCode: httpStatus.CREATED,
    //   success: true,
    //   message: "User Logged in successfully",
    //   data: loginInfo,
    // });
  },
);
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(httpStatus.BAD_REQUEST, "Refresh token is required");
    }

    // const refreshToken = req.headers.authorization;

    const tokenInfo = await AuthService.getNewAccessToken(
      refreshToken as string,
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
  },
);

const logoutUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isProd = envVars.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    } as const;

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User logged out successfully",
      data: null,
    });
  },
);

const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Old password and new password are required",
      );
    }

    const decodedToken = req.user;

    if (!decodedToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    await AuthService.changePassword(
      oldPassword,
      newPassword,
      decodedToken as JwtPayload,
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  },
);
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    if (!decodedToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    await AuthService.resetPassword(req.body, decodedToken as JwtPayload);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  },
);
const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;

    const decodedToken = req.user as JwtPayload;

    if (!decodedToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    await AuthService.setPassword(decodedToken.userId, password);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  },
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user;

    if (!user) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Google authentication failed",
      );
    }

    const tokenInfo = createUserTokens(user);
    setAuthCookie(res, tokenInfo);

    // Redirect with tokens in query params so frontend can capture them
    const userJson = encodeURIComponent(JSON.stringify(user));
    const callbackUrl = `${envVars.FRONTEND_URL}/auth/google/callback?accessToken=${tokenInfo.accessToken}&refreshToken=${tokenInfo.refreshToken}&user=${userJson}`;
    
    res.redirect(callbackUrl);
  },
);

const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError(httpStatus.BAD_REQUEST, "Email is required");
    }

    await AuthService.forgotPassword(email);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset email sent successfully",
      data: null,
    });
  },
);

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logoutUser,
  resetPassword,
  changePassword,
  setPassword,
  googleCallbackController,
  forgotPassword,
};
