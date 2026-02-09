/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import AppError from "../../ErrorHelpers/appError";
import { generatePdf, IInvoiceData } from "../../utils/invoice";
import { sendEmail } from "../../utils/sendEmail";
import { BookingStatus } from "../booking/booking.interface";
import { Booking } from "../booking/booking.model";
import { IRide } from "../ride/ride.interface";
import { Ride } from "../ride/ride.model";
import { ISSLCommerz } from "../sslcommerz/sslcommerz.interface";
import { SSLCommerzService } from "../sslcommerz/sslcommerz.service";
import { IUser } from "../user/user.interface";
import { PaymentStatus } from "./payment.interface";
import { Payment } from "./payment.model";
import httpStatus from "http-status-codes";

let paymentIndexesSynced = false;



const initPayment = async (rideId: string) => {
  if (!paymentIndexesSynced) {
    try {
      await Payment.syncIndexes();
      paymentIndexesSynced = true;
      console.log("Payment indexes synced");
    } catch (indexError) {
      console.error("Payment index sync failed:", indexError);
    }
  }

  const ride = await Ride.findById(rideId).populate("user");

  if (!ride) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
  }

  if (!ride.user) {
    throw new AppError(httpStatus.BAD_REQUEST, "Ride has no valid user");
  }

  const amount = (ride.cost || 0) * (ride.availableSeats || 1);

  // Check latest payment for this ride
  let payment = await Payment.findOne({ ride: rideId }).sort({ createdAt: -1 });

  if (payment) {
    if (payment.status === PaymentStatus.Paid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Payment already completed for this ride");
    }

    if (payment.status === PaymentStatus.Unpaid) {
      console.log("♻️ Reusing existing unpaid payment:", payment._id);
    } else {
      const transactionId = `RIDE-${rideId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      payment = await Payment.findByIdAndUpdate(
        payment._id,
        {
          status: PaymentStatus.Unpaid,
          transactionId,
          amount,
        },
        { new: true, runValidators: true }
      );
      console.log("♻️ Reset previous payment for retry:", payment?._id);
    }
  } else {
    const transactionId = `RIDE-${rideId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    try {
      payment = await Payment.create({
        ride: rideId,
        user: ride.user,
        transactionId,
        amount,
        status: PaymentStatus.Unpaid,
      });
      console.log("✅ New payment created successfully:", payment._id);
    } catch (createError: any) {
      if (createError?.code === 11000) {
        try {
          await Payment.syncIndexes();
          paymentIndexesSynced = true;
          console.log("Payment indexes re-synced after duplicate key");
        } catch (indexError) {
          console.error("Payment index re-sync failed:", indexError);
        }

        payment = await Payment.create({
          ride: rideId,
          user: ride.user,
          transactionId: `RIDE-${rideId}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          amount,
          status: PaymentStatus.Unpaid,
        });
        console.log("✅ New payment created successfully (after index sync):", payment._id);
      } else {
        throw createError;
      }
    }
  }

  if (!payment) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create or retrieve payment");
  }

  // Extract user data with fallbacks
  const user = ride?.user as any;
  const userAddress = user?.address || "Dhaka, Bangladesh";
  const userEmail = user?.email || "customer@example.com";
  const userPhoneNumber = user?.phone || user?.phoneNumber || "01700000000";
  const userName = user?.name || "Customer";

  console.log("User data for payment:", {
    name: userName,
    email: userEmail,
    phone: userPhoneNumber,
    address: userAddress,
    amount: payment.amount,
    transactionId: payment.transactionId,
  });

  // Validate required fields
  if (!userName || !userEmail || !userPhoneNumber) {
    throw new AppError(httpStatus.BAD_REQUEST, "Missing required user information for payment");
  }

  const sslPayload: ISSLCommerz = {
    address: userAddress,
    email: userEmail,
    phoneNumber: userPhoneNumber,
    name: userName,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };
  const sslPayment = await SSLCommerzService.sslPaymentInit(sslPayload);

  console.log("SSLCommerz Full Response:", JSON.stringify(sslPayment, null, 2));
  console.log("SSLCommerz Response Keys:", Object.keys(sslPayment || {}));
  console.log("GatewayPageURL:", sslPayment?.GatewayPageURL);

  if (!sslPayment || !sslPayment.GatewayPageURL) {
    console.error("SSLCommerz did not return GatewayPageURL");
    throw new AppError(httpStatus.BAD_REQUEST, "Failed to initialize payment gateway. Please check SSLCommerz configuration.");
  }

  return {
    paymentUrl: sslPayment.GatewayPageURL,
  }
};
const successPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    // 1. Update payment status
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.Paid },
      { session, new: true }
    ).populate("ride").populate("user");

    if(!updatedPayment){
      throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
    }

    console.log("✅ Payment marked as PAID");
    console.log("📋 Payment details - Has booking:", !!updatedPayment.booking, "Has ride:", !!updatedPayment.ride);

    // 2. Handle BOOKING payment flow
    if (updatedPayment.booking) {
      console.log("🎫 Processing BOOKING payment...");
      
      const updatedBooking = await Booking.findByIdAndUpdate(
        updatedPayment.booking,
        { status: BookingStatus.COMPLETED },
        { new: true, runValidators: true, session }
      )
      .populate("ride", "title")
      .populate("user", "name email");

      if(!updatedBooking){
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
      }

      const invoiceData: IInvoiceData = {
        bookingDate: updatedBooking.createdAt as Date,
        guestCount: updatedBooking.guestCount,
        totalAmount: updatedPayment.amount,
        rideTitle: (updatedBooking?.ride as unknown as IRide).title,
        transactionId: updatedPayment.transactionId,
        customerName: (updatedBooking?.user as unknown as IUser).name,
      };

      // Generate and upload invoice
      const pdfBuffer = await generatePdf(invoiceData).catch(err => {
        console.error("⚠️ PDF generation failed:", err.message);
        return null;
      });

      if (pdfBuffer) {
        const cloudinaryResult: any = await uploadBufferToCloudinary(pdfBuffer, "invoice").catch(err => {
          console.error("⚠️ Cloudinary upload failed:", err.message);
          return null;
        });

        if(cloudinaryResult?.secure_url) {
          await Payment.findOneAndUpdate(
            { _id: updatedPayment._id },
            { invoiceUrl: cloudinaryResult.secure_url },
            { runValidators: true, session }
          );
        }
      }

      // Send email
      await sendEmail({
        to: (updatedBooking?.user as unknown as IUser).email,
        subject: "Your Booking Invoice",
        templateName: "invoice",
        templateData: invoiceData,
        attachments: pdfBuffer ? [
          {
            filename: "invoice.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          }
        ] : []
      }).catch(err => {
        console.error("⚠️ Email sending failed:", err.message);
      });

      await session.commitTransaction();
      session.endSession();
      
      return {
        success: true,
        message: "Booking payment completed successfully",
        data: updatedBooking,
      };
    }

    // 3. Handle RIDE payment flow
    else if (updatedPayment.ride) {
      console.log("🚗 Processing RIDE payment...");
      
      const ride = updatedPayment.ride as unknown as IRide;
      const user = updatedPayment.user as unknown as IUser;

      if(!ride) {
        throw new AppError(httpStatus.NOT_FOUND, "Ride not found");
      }

      const invoiceData: IInvoiceData = {
        bookingDate: new Date(),
        guestCount: ride.availableSeats || 1,
        totalAmount: updatedPayment.amount,
        rideTitle: ride.title,
        transactionId: updatedPayment.transactionId,
        customerName: user?.name || "Customer",
      };

      // Generate and upload invoice
      const pdfBuffer = await generatePdf(invoiceData).catch(err => {
        console.error("⚠️ PDF generation failed:", err.message);
        return null;
      });

      if (pdfBuffer) {
        const cloudinaryResult: any = await uploadBufferToCloudinary(pdfBuffer, "invoice").catch(err => {
          console.error("⚠️ Cloudinary upload failed:", err.message);
          return null;
        });

        if(cloudinaryResult?.secure_url) {
          await Payment.findOneAndUpdate(
            { _id: updatedPayment._id },
            { invoiceUrl: cloudinaryResult.secure_url },
            { runValidators: true, session }
          );
        }
      }

      // Send email
      if (user?.email) {
        await sendEmail({
          to: user.email,
          subject: "Your Ride Payment Receipt",
          templateName: "invoice",
          templateData: invoiceData,
          attachments: pdfBuffer ? [
            {
              filename: "invoice.pdf",
              content: pdfBuffer,
              contentType: "application/pdf",
            }
          ] : []
        }).catch(err => {
          console.error("⚠️ Email sending failed:", err.message);
        });
      }

      await session.commitTransaction();
      session.endSession();
      
      return {
        success: true,
        message: "Ride payment completed successfully",
        data: { ride, payment: updatedPayment },
      };
    }

    // 4. If neither booking nor ride found
    else {
      throw new AppError(httpStatus.NOT_FOUND, "Payment has neither booking nor ride associated");
    }

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const getInvoiceDownloadUrl = async (paymentId: string) => {
  const payment = await Payment.findById(paymentId)
  .select("invoiceUrl")
  // .orFail(new AppError(httpStatus.NOT_FOUND, "Payment not found"));

  if(!payment){
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if(!payment.invoiceUrl){
    throw new AppError(httpStatus.NOT_FOUND, "Invoice url not found");
  }

  return payment.invoiceUrl;
};

const failPayment = async (query: Record<string, string>) => {
  const session = await Booking.startSession();
  session.startTransaction();

  try {
    const updatedPayment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      { status: PaymentStatus.Failed },
      { session, new: true }
    );

    // Handle booking payment
    if (updatedPayment?.booking) {
      const updatedBooking = await Booking.findByIdAndUpdate(
        updatedPayment.booking,
        { status: BookingStatus.FAILED },
        { runValidators: true, session }
      );
      
      await session.commitTransaction();
      session.endSession();
      return { success: false, message: "Booking payment failed", data: updatedBooking };
    }

    // Handle ride payment - just mark payment as failed, no booking to update
    await session.commitTransaction();
    session.endSession();
    return { success: false, message: "Ride payment failed", data: updatedPayment };
    
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
      { session, new: true }
    );

    // Handle booking payment
    if (updatedPayment?.booking) {
      const updatedBooking = await Booking.findByIdAndUpdate(
        updatedPayment.booking,
        { status: BookingStatus.CANCELLED },
        { runValidators: true, session }
      );

      await session.commitTransaction();
      session.endSession();
      return {
        success: false,
        message: "Booking payment cancelled",
        data: updatedBooking,
      };
    }

    // Handle ride payment - just mark payment as cancelled
    await session.commitTransaction();
    session.endSession();
    return {
      success: false,
      message: "Ride payment cancelled",
      data: updatedPayment,
    };
    
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

const getPaymentHistory = async (userId: string) => {
  const payments = await Payment.find({ user: userId })
    .populate("ride", "title cost availableSeats")
    .sort({ createdAt: -1 });

  return payments;
};

const getAllPayments = async () => {
  const payments = await Payment.find()
    .populate("ride", "title cost availableSeats user")
    .populate("user", "name email phone")
    .populate({
      path: "booking",
      populate: {
        path: "user",
        select: "name email phone",
      },
    })
    .sort({ createdAt: -1 });

  return payments;
};

export const PaymentServices = {
  initPayment,
  successPayment,
  getInvoiceDownloadUrl,
  failPayment,
  cancelPayment,
  getPaymentHistory,
  getAllPayments,
};
