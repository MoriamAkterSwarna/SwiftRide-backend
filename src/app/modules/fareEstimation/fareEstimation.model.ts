import { model, Schema } from "mongoose";
import { IFareConfig } from "./fareEstimation.interface";

const fareConfigSchema = new Schema<IFareConfig>(
  {
    vehicleType: {
      type: String,
      enum: ["Car", "Bike"],
      required: true,
      unique: true,
    },
    baseFare: {
      type: Number,
      required: true,
      default: 50,
    },
    perKmRate: {
      type: Number,
      required: true,
      default: 15,
    },
    perMinuteRate: {
      type: Number,
      required: true,
      default: 2,
    },
    minimumFare: {
      type: Number,
      required: true,
      default: 80,
    },
    platformFeePercentage: {
      type: Number,
      required: true,
      default: 10,
    },
    taxPercentage: {
      type: Number,
      required: true,
      default: 5,
    },
  },
  {
    timestamps: true,
  },
);

export const FareConfig = model<IFareConfig>("FareConfig", fareConfigSchema);
