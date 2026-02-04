import { Types } from "mongoose";

export type TDriverStatus = "pending" | "approved" | "rejected" | "suspended";

export interface IDriver {
  user: Types.ObjectId;
  vehicleType: "Car" | "Bike";
  vehicleModel: string;
  vehiclePlateNumber: string;
  drivingLicense: string;
  totalCompletedRides: number;
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  status: TDriverStatus;
  isActive: boolean;
  isOnline: boolean;
  earnings: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}
