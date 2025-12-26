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

    passport.authenticate("local", async(err:any, user:any, info:any)=>{

      if(err){
        return next(err);
      }

      if(!user){
        return next(new AppError(httpStatus.UNAUTHORIZED, info.message || 'Login failed'));
      }

      const userTokens =  createUserTokens(user);

      // delete user.toObject().password;
      const {password: pass , ...rest} = user.toObject();

      setAuthCookie(res, userTokens);

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User Logged in successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
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

const changePassword = catchAsync(
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

    await AuthService.changePassword(
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
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    

    const decodedToken = req.user;

    if (!decodedToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    await AuthService.resetPassword(
      req.body,
      decodedToken as JwtPayload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  }
);
const setPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;


    const decodedToken = req.user as JwtPayload;

    if (!decodedToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
    }

    await AuthService.setPassword(
      decodedToken.userId,
      password
    );

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Password reset successfully",
      data: null,
    });
  }
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    let redirectTo = req.query.redirectTo ? req.query.redirectTo as string : '';
    
    if(redirectTo.startsWith("/")){
      redirectTo = redirectTo.slice(1);
    }


    const user = req.user;

    console.log(user)
    if(!user){
      throw new AppError(httpStatus.UNAUTHORIZED, "Google authentication failed");
    }
    
    const tokenInfo =  createUserTokens(user);
    setAuthCookie(res, tokenInfo);

    // sendResponse(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: "Google authentication successful",
    //   data: user,
    // }); 

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);

  }
);

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logoutUser,
  resetPassword,
  changePassword,
  setPassword,
  googleCallbackController,
};
