import { model, Schema } from "mongoose";
import { IRide, IRideType } from "./ride.interface";

const rideTypeSchema = new Schema<IRideType>({
    rideName: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
})

export const RideType = model<IRideType>("RideType", rideTypeSchema)

const rideSchema = new Schema<IRide>({
    title: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,

    },
    images: {
        type: [String],

    },
    pickUpLocation: {
        type: String,

    },
    dropOffLocation: {
        type: String,

    },
    pickUpTime: {
        type: Date,

    },
    dropOffTime: {
        type: Date,

    },
    cost: {
        type: Number,

    },
    amenities: {
        type: [String],
        default: []

    },
    maxGuests: {
        type: Number,

    },
    minAge: {
        type: Number,

    },
    division: {
        type: Schema.Types.ObjectId,
        ref: "Division",
        required: true,

    },
    rideType: {
        type: Schema.Types.ObjectId,
        ref: "RideType",
        required: true,

    },
    availableSeats: {
        type: Number,

    }
}, {
    timestamps: true
})

export const Ride = model<IRide>("Ride", rideSchema) 