/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from "mongoose";
import {
  IRide,
  IRideType,
  RideVehicle,
  PlaceType,
  RideStatus,
} from "./ride.interface";

export const RideTypeSchema = new Schema<IRideType>(
  {
    rideVehicle: {
      type: String,
      required: true,
      enum: Object.values(RideVehicle),
    },
    placeType: {
      type: String,
      required: true,
      enum: Object.values(PlaceType),
    },
    totalGuest: {
      type: Number,
      
    },
  },
  {
    timestamps: true,
  },
);

export const RideType = model<IRideType>("RideType", RideTypeSchema);

const rideSchema = new Schema<IRide>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },
    images: {
      type: [String],
    },
    pickUpLocation: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
    },
    dropOffLocation: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number },
      },
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
      default: [],
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
    district: {
      type: Schema.Types.ObjectId,
      ref: "District",
      required: true,
    },
    rideType: {
      type: Schema.Types.ObjectId,
      ref: "RideType",
      required: true,
    },
    availableSeats: {
      type: Number,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(RideStatus),
      default: RideStatus.ACTIVE,
    },
    vehicle: {
      type: String,
      enum: Object.values(RideVehicle),
    },
  },
  {
    timestamps: true,
  },
);

rideSchema.pre("save", async function () {
  if (this.isModified("title")) {
    const baseSlug = (this as any).title.toLowerCase().split(" ").join("-");
    let slug = `${baseSlug}-ride`;

    let counter = 0;
    while (await Ride.exists({ slug })) {
      slug = `${baseSlug}-ride-${counter++}`;
    }

    (this as any).slug = slug;
  }
});

rideSchema.pre("findOneAndUpdate", async function () {
  const ride = this.getUpdate() as any;

  if (ride.title) {
    const baseSlug = ride.title.toLowerCase().split(" ").join("-");
    let slug = `${baseSlug}-ride`;

    let counter = 0;
    while (await Ride.exists({ slug })) {
      slug = `${baseSlug}-ride-${counter++}`;
    }

    ride.slug = slug;
  }

  this.setUpdate(ride);
});

export const Ride = model<IRide>("Ride", rideSchema);
