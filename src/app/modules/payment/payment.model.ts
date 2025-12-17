import { model, Schema } from "mongoose";
import { IPayment, PaymentStatus } from "./payment.interface";

const PaymentSchema = new Schema<IPayment>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
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
