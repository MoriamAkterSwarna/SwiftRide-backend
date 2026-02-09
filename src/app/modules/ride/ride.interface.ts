import { Types } from "mongoose";

export enum RideVehicle {
  BIKE = "Bike",
  CAR = "Car",
  VAN = "Van" ,
  BUS = "Bus"
}

export enum PlaceType {
  PRIVATE_PLACE = "Private Place",
  PUBLIC_PLACE = "Public Place",
  INSIDE_CITY = "Inside City",
  OUTSIDE_CITY = "Outside City",
  AIRPORT = "Airport",
}

// export enum totalGuest {
//   BIKE = 2,
//   CAR = 6,

// }

export enum RideStatus {
  ACTIVE = "Active",
  ACCEPTED = "Accepted",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export interface IRideType {
  rideVehicle: RideVehicle;
  placeType: PlaceType;
  totalGuest?: number ;
}

export interface IRide {
  title: string;
  slug?: string;
  description?: string;
  images?: string[];
  pickUpLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  dropOffLocation: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  pickUpTime?: Date;
  dropOffTime?: Date;
  cost?: number;
  amenities?: string[];
  maxGuests?: number;
  minAge?: number;
  division: Types.ObjectId;
  district: Types.ObjectId;
  rideType: Types.ObjectId;
  availableSeats?: number;
  driver?: Types.ObjectId;
  declinedDrivers?: Types.ObjectId[];
  user: Types.ObjectId;
  status?: RideStatus;
  vehicle?: RideVehicle;
  deleteImages?: string[];
}
