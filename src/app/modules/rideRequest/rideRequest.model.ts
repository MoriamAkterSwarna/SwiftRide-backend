import { model, Schema } from "mongoose";
import { IRideRequest, RideRequestStatus } from "./rideRequest.interface";

const rideRequestSchema = new Schema<IRideRequest>(
  {
    rider: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    pickupLocation: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    dropoffLocation: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    status: {
      type: String,
      enum: Object.values(RideRequestStatus),
      default: RideRequestStatus.REQUESTED,
    },
    vehicleType: {
      type: String,
      enum: ["Car", "Bike"],
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
    },
    pickedUpAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
      enum: ["rider", "driver", "admin"],
    },
    cancellationReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const RideRequest = model<IRideRequest>(
  "RideRequest",
  rideRequestSchema,
);
