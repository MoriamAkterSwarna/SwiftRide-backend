
import z from "zod";
import { IsActive, Role } from "./user.interface";
 
export const createUserZodSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters long." })
            .max(50, { message: "Name cannot exceed 50 characters." }),
        email: z
            .string()
            .email({ message: "Invalid email address format." })
            .min(5, { message: "Email must be at least 5 characters long." })
            .max(100, { message: "Email cannot exceed 100 characters." }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long." })
            .regex(/^(?=.*[A-Z])/, {
                message: "Password must contain at least 1 uppercase letter.",
            })
            .regex(/^(?=.*[!@#$%^&*])/, {
                message: "Password must contain at least 1 special character.",
            })
            .regex(/^(?=.*\d)/, {
                message: "Password must contain at least 1 number.",
            }),
        role: z.enum(Object.values(Role) as [string, string], {
            message: "Role must be either USER, DRIVER, RIDER, ADMIN, or SUPER_ADMIN",
        }).optional(),
        agreeToTerms: z.boolean().refine((val) => val === true, {
            message: "You must agree to the terms and conditions",
        }),
        phone: z
            .string()
            .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
                message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
            })
            .optional(),
        address: z
            .string()
            .max(200, { message: "Address cannot exceed 200 characters." })
            .optional()
    })
});
 
export const updateUserZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }).optional(),
 
  phone: z
    .string()
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message:
        "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  picture: z
    .string()
    .optional(),
  address: z
    .string()
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
    role: z.enum(Object.values(Role) as [string]).optional(),
    isActive : z.enum(Object.values(IsActive) as [string]).optional(),
    status: z.enum(['Active', 'Blocked'] as [string, string]).optional(),
    isDeleted: z.boolean().optional(),
    isVerified: z.boolean().optional(),

});
