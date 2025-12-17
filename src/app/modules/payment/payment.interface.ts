/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PaymentStatus {
     Paid = "PAID",
     Unpaid = "UNPAID",
     Failed = "FAILED",
     Cancelled = "CANCELLED",
     Refunded = "REFUNDED",
}

export interface IPayment {
 
    booking: Types.ObjectId;
    transactionId: string;
    amount: number;
    paymentGatewayData?: any;
    status: PaymentStatus;
    invoiceUrl?: string;
    
   
}
