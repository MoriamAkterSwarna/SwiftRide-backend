/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import  httpStatus  from 'http-status-codes';
import { AuthService } from "./auth.service";
import AppError from "../../ErrorHelpers/appError";
import { setAuthCookie } from "../../utils/setCookie";

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
    if(!refreshToken){
      throw new AppError(httpStatus.BAD_REQUEST, 'Refresh token is required');
    }

    // const refreshToken = req.headers.authorization; 


    const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string);


    // res.cookie("accessToken", tokenInfo.accessToken, {
    //   httpOnly: true,
    //   secure: false, // Set to true if using HTTPS
    // }); 

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Logged in successfully",
      data: tokenInfo,
    });
  }
);



export const AuthController = {
    credentialsLogin,
    getNewAccessToken
}