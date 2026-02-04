import { model, Schema } from "mongoose";
import { IDriverLocation } from "./driverLocation.interface";

const driverLocationSchema = new Schema<IDriverLocation>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: "2dsphere",
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    vehicleType: {
      type: String,
      enum: ["Car", "Bike"],
      required: true,
    },
    heading: {
      type: Number,
      min: 0,
      max: 360,
    },
    speed: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Create 2dsphere index for geospatial queries
driverLocationSchema.index({ location: "2dsphere" });
driverLocationSchema.index({ isOnline: 1, vehicleType: 1 });

export const DriverLocation = model<IDriverLocation>(
  "DriverLocation",
  driverLocationSchema,
);
