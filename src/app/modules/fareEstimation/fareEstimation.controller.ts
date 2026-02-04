import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { FareEstimationServices } from "./fareEstimation.service";

const estimateFare = catchAsync(async (req: Request, res: Response) => {
  const result = await FareEstimationServices.estimateFare(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fare estimated successfully",
    data: result,
  });
});

const getAllFareConfigs = catchAsync(async (req: Request, res: Response) => {
  const result = await FareEstimationServices.getAllFareConfigs();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fare configurations fetched successfully",
    data: result,
  });
});

const updateFareConfig = catchAsync(async (req: Request, res: Response) => {
  const { vehicleType } = req.params;
  const result = await FareEstimationServices.updateFareConfig(
    vehicleType as "Car" | "Bike",
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Fare configuration updated successfully",
    data: result,
  });
});

export const FareEstimationController = {
  estimateFare,
  getAllFareConfigs,
  updateFareConfig,
};
