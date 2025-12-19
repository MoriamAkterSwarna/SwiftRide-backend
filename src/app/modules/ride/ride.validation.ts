import { z } from "zod";

// RideType Validation Schemas
export const createRideTypeSchema = z.object({
    rideVehicle: z.enum(["Bike", "Car"]),
    placeType: z.enum(["Private Place", "Public Place"]),
    totalGuest: z.number().optional(),
});

export const updateRideTypeSchema = z.object({
    rideVehicle: z.enum(["Bike", "Car"]).optional(),
    placeType: z.enum(["Private Place", "Public Place"]).optional(),
    totalGuest: z.number().optional(),
});

// Ride Validation Schemas
const locationSchema = z.object({
    address: z.string().min(1),
    coordinates: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }).optional(),
});

export const createRideSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    pickUpLocation: locationSchema,
    dropOffLocation: locationSchema,
    pickUpTime: z.string().optional(),
    dropOffTime: z.string().optional(),
    cost: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    maxGuests: z.number().optional(),
    minAge: z.number().optional(),
    division: z.string().min(1),
    district: z.string().min(1),
    rideType: z.string().min(1),
    availableSeats: z.number().optional(),
    driver: z.string().optional(),
    status: z.enum(["Active", "Completed", "Cancelled"]).optional(),
    vehicle: z.enum(["Bike", "Car"]).optional(),
});

export const updateRideSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    pickUpLocation: locationSchema.optional(),
    dropOffLocation: locationSchema.optional(),
    pickUpTime: z.string().optional(),
    dropOffTime: z.string().optional(),
    cost: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    maxGuests: z.number().optional(),
    minAge: z.number().optional(),
    division: z.string().min(1).optional(),
    district: z.string().min(1).optional(),
    rideType: z.string().min(1).optional(),
    availableSeats: z.number().optional(),
    driver: z.string().optional(),
    status: z.enum(["Active", "Completed", "Cancelled"]).optional(),
    vehicle: z.enum(["Bike", "Car"]).optional(),
    deleteImages: z.array(z.string()).optional(),
});
