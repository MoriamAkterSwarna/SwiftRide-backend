import { Schema, model } from "mongoose";
import { IDriver } from "./driver.interface";

const driverSchema = new Schema<IDriver>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["Car", "Bike"],
      required: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    vehiclePlateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    drivingLicense: {
      type: String,
      required: true,
      unique: true,
    },
    totalCompletedRides: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    earnings: {
      type: Number,
      default: 0,
    },
    currentLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  {
    timestamps: true,
  },
);

// Index for location-based queries
driverSchema.index({ "currentLocation.latitude": 1, "currentLocation.longitude": 1 });
driverSchema.index({ isOnline: 1, status: 1, vehicleType: 1 });

export const Driver = model<IDriver>("Driver", driverSchema);
