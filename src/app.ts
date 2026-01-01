/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */



import express, { NextFunction, Request, Response } from "express";

import cors from "cors";
import { router } from "./app/routes";
import { envVars } from "./app/config/env";
import { globalErrorHandlers } from "./app/middlewares/globalErrorHandlers";
import  httpStatus  from 'http-status-codes';
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import passport from "passport";

import expressSession from "express-session";
import  "./app/config/passport" ;


const app = express();


app.use(
  expressSession({
    secret: envVars.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors( {
  origin: envVars.FRONTEND_URL,
  credentials: true
}))



app.use("/api/v1",router )



app.get("/", async (req: Request, res: Response) => {
  res.status(200).send("SwiftRide Backend is running");
});



app.use(globalErrorHandlers);


app.use(notFound);

  

export default app;