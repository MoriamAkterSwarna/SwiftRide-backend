/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */



import express, { NextFunction, Request, Response } from "express";

import cors from "cors";
import { router } from "./app/routes";
import { envVars } from "./app/config/env";
import { globalErrorHandlers } from "./app/middlewares/globalErrorHandlers";
import { httpStatus } from 'http-status';
import notFound from "./app/middlewares/notFound";

const app = express();

app.use(express.json());
app.use(cors())



app.use("/api/v1",router )



app.get("/", async (req: Request, res: Response) => {
  res.status(200).send("SwiftRide Backend is running");
});



app.use(globalErrorHandlers);


app.use(notFound);

  

export default app;