import { z } from "zod";

const createDriverValidationSchema = z.object({
  body: z.object({
    user: z.string({
      required_error: "User ID is required",
    }),
    vehicleType: z.enum(["Car", "Bike"], {
      required_error: "Vehicle type is required",
    }),
    vehicleModel: z.string({
      required_error: "Vehicle model is required",
    }),
    vehiclePlateNumber: z.string({
      required_error: "Vehicle plate number is required",
    }),
    drivingLicense: z.string({
      required_error: "Driving license is required",
    }),
  }),
});

const updateDriverValidationSchema = z.object({
  body: z.object({
    vehicleType: z.enum(["Car", "Bike"]).optional(),
    vehicleModel: z.string().optional(),
    vehiclePlateNumber: z.string().optional(),
    drivingLicense: z.string().optional(),
    status: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
    isActive: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    isOnline: z.boolean().optional(),
  }),
});

export const DriverValidations = {
  createDriverValidationSchema,
  updateDriverValidationSchema,
};
