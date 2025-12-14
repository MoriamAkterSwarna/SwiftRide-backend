import { Types } from "mongoose";

export interface IRideType {
    rideName: string;

}



export interface IRide {
    title: string;
    slug: string;
    description?: string;
    images?: string[];
    pickUpLocation?: string;
    dropOffLocation?: string;
    pickUpTime?: Date;
    dropOffTime?: Date;
    cost?: number;
    amenities?: string[];
    maxGuests?: number;
    minAge?: number;
    division: Types.ObjectId;
    rideType: Types.ObjectId;
    availableSeats?: number;



}