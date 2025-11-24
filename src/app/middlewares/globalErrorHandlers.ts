/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../ErrorHelpers/appError";

export const globalErrorHandlers=((err:any, req:Request, res:Response,next:NextFunction) => {

   let  statusCode = 500;
    let message = `Something went wrong! ${err.message}`;

  
    if (err instanceof AppError){
        statusCode = err.statusCode;
        message = err.message;
    }else if(err instanceof Error){
      statusCode = 500;
        message = err.message;
    }

  res.status(statusCode).json({
    success: false,
    message,
    err,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  })
});