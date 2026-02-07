import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RideRequestServices } from "./rideRequest.service";
import { JwtPayload } from "jsonwebtoken";
import { RideRequestStatus } from "./rideRequest.interface";

const requestRide = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await RideRequestServices.requestRide(user.userId, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Ride requested successfully",
    data: result,
  });
});

const acceptRide = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const { requestId } = req.params;
  const result = await RideRequestServices.acceptRide(user.userId, requestId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ride accepted successfully",
    data: result,
  });
});

const updateRideStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await RideRequestServices.updateRideStatus(
    id,
    status as RideRequestStatus,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ride status updated successfully",
    data: result,
  });
});

const cancelRide = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const { id } = req.params;
  const { reason } = req.body;
  const result = await RideRequestServices.cancelRide(
    id,
    user.userId,
    user.role,
    reason,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ride cancelled successfully",
    data: result,
  });
});

const getMyRideHistory = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await RideRequestServices.getRiderHistory(
    user.userId,
    req.query as Record<string, string>,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ride history fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getUserActiveRideRequests = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await RideRequestServices.getUserActiveRideRequests(
    user.userId,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Active ride requests fetched successfully",
    data: result,
  });
});

const getMyDriverRides = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await RideRequestServices.getDriverRides(
    user.userId,
    req.query as Record<string, string>,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver rides fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllRideRequests = catchAsync(async (req, res) => {
  const result = await RideRequestServices.getAllRideRequests(
    req.query as Record<string, string>,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "All ride requests fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleRideRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RideRequestServices.getSingleRideRequest(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Ride request fetched successfully",
    data: result,
  });
});

const getAvailableRides = catchAsync(async (req, res) => {
  const result = await RideRequestServices.getAvailableRides(
    req.query as Record<string, string>,
  );
  const availableRides = result.data.filter(
    (ride) => ride.status === RideRequestStatus.REQUESTED,
  );
  console.log(availableRides, "availableRides");
  
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Available rides fetched successfully",
    meta: result.meta,
    data: availableRides,
  });
});

const estimateFare = catchAsync(async (req, res) => {
  const result = await RideRequestServices.estimateFare(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Fare estimated successfully",
    data: result,
  });
});

const assignDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { driverId } = req.body;
  const result = await RideRequestServices.assignDriver(id, driverId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver assigned successfully",
    data: result,
  });
});

export const RideRequestControllers = {
  requestRide,
  acceptRide,
  updateRideStatus,
  cancelRide,
  getMyRideHistory,
  getUserActiveRideRequests,
  getMyDriverRides,
  getAllRideRequests,
  getSingleRideRequest,
  getAvailableRides,
  estimateFare,
  assignDriver,
};
