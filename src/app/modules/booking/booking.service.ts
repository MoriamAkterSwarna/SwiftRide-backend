/* eslint-disable @typescript-eslint/no-empty-function */
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
import { ISSLCommerz } from "../sslcommerz/sslcommerz.interface";
import { SSLCommerzService } from "../sslcommerz/sslcommerz.service";

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
      [
        {
          ...payload,
          user: userId,
        },
      ],
      { session }
    );

    const payment = await Payment.create(
      [
        {
          booking: booking[0]._id,
          status: PaymentStatus.Unpaid,
          transactionId: transactionId,
          amount: amount,
        },
      ],
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

    const userAddress = (updatedBooking?.user as any).address;
    const userEmail = (updatedBooking?.user as any).email;
    const userPhoneNumber = (updatedBooking?.user as any).phone;
    const userName = (updatedBooking?.user as any).name;

    const sslPayload: ISSLCommerz = {
            address: userAddress,
            email: userEmail,
            phoneNumber: userPhoneNumber,
            name: userName,
            amount: amount,
            transactionId: transactionId
        }
        const sslPayment = await SSLCommerzService.sslPaymentInit(sslPayload);



    await session.commitTransaction();
    session.endSession();

    return {
      booking: updatedBooking,
      paymentUrl: sslPayment.GatewayPageURL
    }
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const getUserBookings = async () => {

};

const getSingleBooking = async () => {};

const updateBookingStatus = async (

) => {};

export const BookingServices = {
  createBooking,
  getUserBookings,
  getSingleBooking,
  updateBookingStatus,
};
