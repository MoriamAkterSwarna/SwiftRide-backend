/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Booking } from "./booking.model";
import { IBooking } from "./booking.interface";

import { User } from "../user/user.model";
import AppError from "../../ErrorHelpers/appError";
import httpStatus from "http-status-codes";
import { PaymentStatus } from "../payment/payment.interface";
import { Payment } from "../payment/payment.model";
import { Ride } from "../ride/ride.model";

const getTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};

const createBooking = async (payload: Partial<IBooking>, userId: string) => {
  const transactionId = getTransactionId();

  const session = await Booking.startSession();

  session.startTransaction();

  try {
    const user = await User.findById(userId);

    if (!user?.phone || !user?.address) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "User phone or address is not found"
      );
    }

    const ride = await Ride.findById(payload.ride).select("cost");

    if (!ride?.cost) {
      throw new AppError(httpStatus.BAD_REQUEST, "Ride cost is not found");
    }
    const amount = Number(ride.cost) * Number(payload.guestCount!);

    const booking = await Booking.create(
      [{
        ...payload,
        user: userId,
      }],
      {session }
    );

    const payment = await Payment.create(
      [{
        booking: booking[0]._id,
        status: PaymentStatus.Unpaid,
        transactionId: transactionId,
        amount: amount,
      }],
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking[0]._id,
      {
        payment: payment[0]._id,
      },
      { new: true, runValidators: true, session }
    )
      .populate("user", "name email phone address")
      .populate("ride", "title cost")
      .populate("payment");

    await session.commitTransaction();
    session.endSession();

    return updatedBooking;

  } catch (error:any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const getUserBookings = async (query: Record<string, unknown>) => {};

const getSingleBooking = async (id: string) => {};

const updateBookingStatus = async (
  id: string,
  payload: Partial<IBooking>
) => {};

export const BookingServices = {
  createBooking,
  getUserBookings,
  getSingleBooking,
  updateBookingStatus,
};
