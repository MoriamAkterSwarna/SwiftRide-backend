import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DriverServices } from "./driver.service";
import { JwtPayload } from "jsonwebtoken";


const createDriver = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;

  // If the requester is a USER, they can only create a profile for themselves
  if (user && user.role === "USER") {
    req.body.user = user.userId;
  }

  const result = await DriverServices.createDriverIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Driver created successfully",
    data: result,
  });
});

const getAllDrivers = catchAsync(async (req, res) => {
 
  const result = await DriverServices.getAllDriversFromDB(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Drivers fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllRidesPending = catchAsync(async (req, res) => {
 
  const result = await DriverServices.getAllRidesPendingFromDB(req.query as Record<string, string>);
  console.log(result, "result");

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Rides fetched successfully",
    data: {
      rides: result,
      total: result.length,
      // requested: result.filter((ride) => ride.status === RideRequestStatus.REQUESTED).length,
      // accepted: result.filter((ride) => ride.status === RideRequestStatus.ACCEPTED).length,
      // completed: result.filter((ride) => ride.status === RideRequestStatus.COMPLETED).length,
      // cancelled: result.filter((ride) => ride.status === RideRequestStatus.CANCELLED).length,
      // pending: result.filter((ride) => ride.status === RideRequestStatus.PENDING).length,
    },
  });
});


const getSingleDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverServices.getSingleDriverFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver fetched successfully",
    data: result,
  });
});

const updateDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverServices.updateDriverIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver updated successfully",
    data: result,
  });
});

const deleteDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverServices.deleteDriverFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver deleted successfully",
    data: result,
  });
});

const toggleAvailability = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await DriverServices.toggleDriverAvailability(user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver availability updated successfully",
    data: result,
  });
});

const approveDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverServices.changeDriverStatus(id, "approved");
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver approved successfully",
    data: result,
  });
});

const rejectDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverServices.changeDriverStatus(id, "rejected");
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver rejected successfully",
    data: result,
  });
});

const suspendDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const result = await DriverServices.suspendDriver(id, reason);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver suspended successfully",
    data: result,
  });
});

const reactivateDriver = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DriverServices.reactivateDriver(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver reactivated successfully",
    data: result,
  });
});

const getMyEarnings = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await DriverServices.getDriverEarningsHistory(
    user.userId,
    req.query as Record<string, string>
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver earnings fetched successfully",
    data: result,
  });
});

const getMyDriverProfile = catchAsync(async (req, res) => {
  const user = req.user as JwtPayload;
  const result = await DriverServices.getDriverByUserId(user.userId);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Driver profile fetched successfully",
    data: result,
  });
});


export const DriverControllers = {
  createDriver,
  getAllDrivers,
  getSingleDriver,
  updateDriver,
  deleteDriver,
  toggleAvailability,
  approveDriver,
  rejectDriver,
  suspendDriver,
  reactivateDriver,
  getMyEarnings,
  getMyDriverProfile,
  getAllRidesPending,
};
