import { z } from "zod";

const updateLocationValidation = z.object({
  body: z.object({
    latitude: z
      .number({
        required_error: "Latitude is required",
      })
      .min(-90)
      .max(90),
    longitude: z
      .number({
        required_error: "Longitude is required",
      })
      .min(-180)
      .max(180),
    heading: z.number().min(0).max(360).optional(),
    speed: z.number().min(0).optional(),
  }),
});

const findNearbyDriversValidation = z.object({
  body: z.object({
    latitude: z
      .number({
        required_error: "Latitude is required",
      })
      .min(-90)
      .max(90),
    longitude: z
      .number({
        required_error: "Longitude is required",
      })
      .min(-180)
      .max(180),
    radiusKm: z.number().min(0.1).max(50).optional(),
    vehicleType: z.enum(["Car", "Bike"]).optional(),
    limit: z.number().min(1).max(50).optional(),
  }),
});

export const DriverLocationValidation = {
  updateLocationValidation,
  findNearbyDriversValidation,
};
