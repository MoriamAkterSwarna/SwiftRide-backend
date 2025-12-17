import { Types } from "mongoose";

export enum BookingStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export interface IBooking {
  user: Types.ObjectId;
  ride: Types.ObjectId;
  payment?: Types.ObjectId;
  status: BookingStatus;
  guestCount: number;
}
