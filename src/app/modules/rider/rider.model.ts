import { Schema, model } from "mongoose";
import { IRider } from "./rider.interface";

const riderSchema = new Schema<IRider>(
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "on-ride", "idle"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Rider = model<IRider>("Rider", riderSchema);
