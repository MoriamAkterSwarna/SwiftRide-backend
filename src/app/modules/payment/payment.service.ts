/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../ErrorHelpers/appError";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BookingStatus } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { IRide } from "../ride/ride.interface";
import { ISSLCommerz } from "../sslcommerz/sslcommerz.interface";
import { SSLCommerzService } from "../sslcommerz/sslcommerz.service";
import { IUser } from "../user/user.interface";
import { PaymentStatus } from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from "http-status-codes";

const initPayment = async (bookingId: string) => {
  const payment = await Payment.findOne({ booking: bookingId });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  const booking = await Booking.findById(payment.booking);

  const userAddress = (booking?.user as any).address;
  const userEmail = (booking?.user as any).email;
  const userPhoneNumber = (booking?.user as any).phone;
  const userName = (booking?.user as any).name;

  const sslPayload: ISSLCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };
  const sslPayment = await SSLCommerzService.sslPaymentInit(sslPayload);

  return {
    paymentUrl: sslPayment.GatewayPageURL,
  }
};
const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.Paid },
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BookingStatus.COMPLETED },
      {new: true, runValidators: true, session }
    )
    .populate("ride", "title")
    .populate("user", "name email")



      if(!updatedBooking){
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
      }

      if(!updatedPayment){
        throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
      }

     const invoiceData: IInvoiceData = {
        bookingDate: updatedBooking.createdAt as Date,
        guestCount: updatedBooking.guestCount,
        totalAmount: updatedPayment.amount,
        rideTitle: (updatedBooking?.ride as unknown as IRide).title,
        transactionId: updatedPayment.transactionId,
        customerName: (updatedBooking?.user as unknown as IUser).name,
      
    }

    const pdfBuffer = await generatePdf(invoiceData);

    await sendEmail({
      to: (updatedBooking?.user as unknown as IUser).email,
      subject: "Your Booking Invoice",
      templateName: "invoice ",
      templateData: invoiceData,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        }
      ]
    })

    await session.commitTransaction();
    session.endSession();
    return {
      success: true,
      message: "Payment successful",
      data: updatedBooking,
    };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const failPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.Failed },
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BookingStatus.FAILED },
      { runValidators: true, session }
    );

   

    await session.commitTransaction();
    session.endSession();
    return { success: false, message: "Payment failed", data: updatedBooking };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const cancelPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.Cancelled },
      { session }
    );

    const updatedBooking = await Booking.findByIdAndUpdate(
      updatedPayment?.booking,
      { status: BookingStatus.CANCELLED },
      { runValidators: true, session }
    );

    await session.commitTransaction();
    session.endSession();
    return {
      success: false,
      message: "Payment cancelled",
      data: updatedBooking,
    };
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

export const PaymentServices = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
};
