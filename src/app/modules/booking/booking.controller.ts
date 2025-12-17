import { Request, Response } from "express";
// import catchAsync from "../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { BookingServices } from "./booking.service";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const decodeToken = req.user as JwtPayload;
  const booking = await BookingServices.createBooking(
    req.body,
    decodeToken.userId
  );
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Booking created successfully",
    data: booking,
  });
});

const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const bookings = await BookingServices.getUserBookings(
    req.query as Record<string, string>,
    user.userId
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings.data,
    meta: bookings.meta,
  });
});
const getSingleBooking = catchAsync(async (req: Request, res: Response) => {
  const booking = await BookingServices.getSingleBooking(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: booking
   
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const bookings = await BookingServices.getAllBookings( req.query as Record<string, string>);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings.data,
    meta: bookings.meta,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingServices.updateBookingStatus(id, req.body.status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking Status Updated Successfully",
    data: result,
  });
});

export const BookingControllers = {
  createBooking,
  getAllBookings,
  getSingleBooking,
  getUserBookings,
  updateBookingStatus,
};
