import { model, Schema } from "mongoose";
import { IPayment, PaymentStatus } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
    },
    ride: {
      type: Schema.Types.ObjectId,
      ref: "Ride",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      sparse: true  // Allow null values but enforce uniqueness for non-null
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentGatewayData: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.Unpaid,
    },
    invoiceUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
