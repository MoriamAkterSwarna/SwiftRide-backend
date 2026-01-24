import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RiderServices } from "./rider.service";

interface TUserPayload {
  userId: string;
  email: string;
  role: string;
}

const createRider = catchAsync(async (req, res) => {
  const user = req.user as TUserPayload;

  // If the requester is a USER, they can only create a profile for themselves
  if (user && user.role === "USER") {
    req.body.user = user.userId;
  }

  const result = await RiderServices.createRiderIntoDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Rider created successfully",
    data: result,
  });
});

const getAllRiders = catchAsync(async (req, res) => {
  const result = await RiderServices.getAllRidersFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Riders fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleRider = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RiderServices.getSingleRiderFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Rider fetched successfully",
    data: result,
  });
});

const updateRider = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RiderServices.updateRiderIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Rider updated successfully",
    data: result,
  });
});

const deleteRider = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await RiderServices.deleteRiderFromDB(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Rider deleted successfully",
    data: result,
  });
});

export const RiderControllers = {
  createRider,
  getAllRiders,
  getSingleRider,
  updateRider,
  deleteRider,
};
