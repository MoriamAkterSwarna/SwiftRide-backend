import { Types } from "mongoose";

export type TRiderStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "on-ride"
  | "idle";

export interface IRider {
  user: Types.ObjectId;
  vehicleType: "Car" | "Bike";
  vehicleModel: string;
  vehiclePlateNumber: string;
  drivingLicense: string;
  totalCompletedRides: number;
  rating: number;
  isVerified: boolean;
  status: TRiderStatus;
  isActive: boolean;
}
