import { Types } from "mongoose";

export interface IDriverLocation {
  driver: Types.ObjectId; // Reference to Driver
  user: Types.ObjectId; // Reference to User
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  lastUpdated: Date;
  isOnline: boolean;
  vehicleType: "Car" | "Bike";
  heading?: number; // Direction in degrees (0-360)
  speed?: number; // Speed in km/h
}

export interface INearbyDriverQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  vehicleType?: "Car" | "Bike";
  limit?: number;
}

export interface INearbyDriver {
  driver: Types.ObjectId;
  user: {
    _id: Types.ObjectId;
    name: string;
    picture?: string;
    phone?: string;
  };
  driverInfo: {
    vehicleType: string;
    vehicleModel: string;
    vehiclePlateNumber: string;
    rating: number;
    totalCompletedRides: number;
  };
  distance: number; // in kilometers
  estimatedArrivalMinutes: number;
}
