import { z } from "zod";

const estimateFareValidation = z.object({
  body: z.object({
    pickupLocation: z.object({
      latitude: z.number({
        required_error: "Pickup latitude is required",
      }),
      longitude: z.number({
        required_error: "Pickup longitude is required",
      }),
      address: z.string().optional(),
    }),
    dropoffLocation: z.object({
      latitude: z.number({
        required_error: "Dropoff latitude is required",
      }),
      longitude: z.number({
        required_error: "Dropoff longitude is required",
      }),
      address: z.string().optional(),
    }),
    vehicleType: z.enum(["Car", "Bike"], {
      required_error: "Vehicle type is required",
    }),
  }),
});

const updateFareConfigValidation = z.object({
  body: z.object({
    baseFare: z.number().min(0).optional(),
    perKmRate: z.number().min(0).optional(),
    perMinuteRate: z.number().min(0).optional(),
    minimumFare: z.number().min(0).optional(),
    platformFeePercentage: z.number().min(0).max(100).optional(),
    taxPercentage: z.number().min(0).max(100).optional(),
  }),
});

export const FareEstimationValidation = {
  estimateFareValidation,
  updateFareConfigValidation,
};
