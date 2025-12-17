import { z } from "zod";
import { BookingStatus } from "./booking.interface";

export const createBookingValidationSchema = z.object({
    ride : z.string(),
    guestCount : z.number().int().positive()
});

export const updateBookingValidationSchema = z.object({ 
    status : z.enum(Object.values(BookingStatus) as [string])
  
});

