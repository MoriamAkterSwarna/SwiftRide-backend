import { Types } from "mongoose";

export enum RideRequestStatus {
  REQUESTED = "requested",
  ACCEPTED = "accepted",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  PENDING = "pending",
}

export interface IRideRequest {
  rider: Types.ObjectId; // User requesting the ride
  driver?: Types.ObjectId; // Driver who accepted 
  user?: Types.ObjectId; // User who created the request
  pickupLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  dropoffLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  status: RideRequestStatus;
  vehicleType: "Car" | "Bike";
  fare: number;
  requestedAt: Date;
  acceptedAt?: Date;
  pickedUpAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelledBy?: "rider" | "driver" | "admin";
  cancellationReason?: string;
}
