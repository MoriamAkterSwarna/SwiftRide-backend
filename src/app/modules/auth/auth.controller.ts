/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import  httpStatus  from 'http-status-codes';
import { AuthService } from "./auth.service";

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    

    const loginInfo = await AuthService.credentialsLogin(req.body);
   

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Logged in successfully",
      data: loginInfo,
    });
  }
);

export const AuthController = {
    credentialsLogin,
}