import { z } from "zod";

const createRideRequestValidationSchema = z.object({
  body: z.object({
    pickupLocation: z.object({
      address: z.string({
        required_error: "Pickup address is required",
      }),
      coordinates: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
    }),
    dropoffLocation: z.object({
      address: z.string({
        required_error: "Dropoff address is required",
      }),
      coordinates: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
        })
        .optional(),
    }),
    vehicleType: z.enum(["Car", "Bike"], {
      required_error: "Vehicle type is required",
    }),
    fare: z.number({
      required_error: "Fare is required",
    }),
  }),
});

const updateRideStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([
      "requested",
      "accepted",
      "picked_up",
      "in_transit",
      "completed",
      "cancelled",
    ]),
  }),
});

const cancelRideValidationSchema = z.object({
  body: z.object({
    reason: z.string().optional(),
  }),
});

export const RideRequestValidations = {
  createRideRequestValidationSchema,
  updateRideStatusValidationSchema,
  cancelRideValidationSchema,
};
