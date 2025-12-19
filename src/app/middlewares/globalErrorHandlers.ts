/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../ErrorHelpers/appError";
import { Profile } from 'passport-google-oauth20';
import mongoose, { Mongoose } from "mongoose";
import { handleDuplicateError } from "../helpers/handleDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handleValidationError } from "../helpers/handleValidationError";
import { handleZodError } from "../helpers/handleZodError";
import { deleteImageFromCloudinary } from "../config/cloudinary.config";



export const globalErrorHandlers = async(err: any, req: Request, res: Response, next: NextFunction) => {

  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }

  if (req.file) {
        await deleteImageFromCloudinary(req.file.path)
    }

    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)

        await Promise.all(imageUrls.map(url => deleteImageFromCloudinary(url)))
    }


  let statusCode = 500;
  let message = `Something went wrong! ${err.message}`;

  let errorSources: any = [
    //   {
    //   path:"isDeleted",
    //   message: "Cast Failed"
    //  }
  ];

  if (err.code === 11000) {
    // console.log("Duplicate Error")
    //   statusCode = 400;
    //  const duplicate = err.message.match(/"([^"]*)"/);
    //   message = `Duplicate value entered for ${duplicate ? duplicate[1] : 'field'}. Please choose another value!`; 
    const simplifiedError = handleDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

  } else if (err.name === "CastError") {

    // statusCode = 400;
    //  message = `Invalid MongoDB ObjectID. Profile not found with id: ${err.value}`; 

    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;

  } else if (err.name === "ValidationError") {
    //   statusCode = 400;
    // const errors = Object.values(err.errors);

    // errors.forEach((el: any) => {
    //   // errorSources.push(el.path);

    //   errorSources.push({
    //     path: el.path,
    //     message: el.message,
    //   });
    // });
    // // console.log(errorSources); 
    // message = err.message;

    const simplifiedError = handleValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }
  else if (err.name === "ZodError") {

    // statusCode = 400;
    // const errors = err.issues;
    // err.forEach((el: any) => {
    //   errorSources.push({
    //     path: el.path[el.path.length - 1]  ,
    //     //path : nickname inside lastname inside name 

    //     message: el.message,
    //   });
    // }); 

    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;

  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  })
});