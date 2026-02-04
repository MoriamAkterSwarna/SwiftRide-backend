import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DriverLocationServices } from "./driverLocation.service";

const updateLocation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await DriverLocationServices.updateDriverLocation(
    userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Location updated successfully",
    data: result,
  });
});

const getDriverLocation = catchAsync(async (req: Request, res: Response) => {
  const { driverId } = req.params;
  const result = await DriverLocationServices.getDriverLocation(driverId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver location fetched successfully",
    data: result,
  });
});

const findNearbyDrivers = catchAsync(async (req: Request, res: Response) => {
  const result = await DriverLocationServices.findNearbyDrivers(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Nearby drivers fetched successfully",
    data: result,
  });
});

const setOnlineStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const { isOnline } = req.body;
  const result = await DriverLocationServices.setDriverOnlineStatus(
    userId,
    isOnline,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Driver is now ${isOnline ? "online" : "offline"}`,
    data: result,
  });
});

const removeLocation = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  await DriverLocationServices.removeDriverLocation(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Location removed successfully",
    data: null,
  });
});

const getOnlineDriversCount = catchAsync(
  async (req: Request, res: Response) => {
    const vehicleType = req.query.vehicleType as "Car" | "Bike" | undefined;
    const result = await DriverLocationServices.getOnlineDriversCount(vehicleType);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Online drivers count fetched successfully",
      data: result,
    });
  },
);

const getDriversInArea = catchAsync(async (req: Request, res: Response) => {
  const { northEast, southWest, vehicleType } = req.body;
  const result = await DriverLocationServices.getDriversInArea(
    { northEast, southWest },
    vehicleType,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Drivers in area fetched successfully",
    data: result,
  });
});

export const DriverLocationController = {
  updateLocation,
  getDriverLocation,
  findNearbyDrivers,
  setOnlineStatus,
  removeLocation,
  getOnlineDriversCount,
  getDriversInArea,
};
