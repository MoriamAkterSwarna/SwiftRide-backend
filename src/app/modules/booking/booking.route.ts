import express from "express";
import { BookingControllers } from "./booking.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createBookingValidationSchema, updateBookingValidationSchema } from "./booking.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.post(
  "/",
  checkAuth(...Object.values(Role)),
  validateRequest(createBookingValidationSchema),
  BookingControllers.createBooking
);

router.get("/",checkAuth(Role.ADMIN, Role.SUPER_ADMIN), BookingControllers.getAllBookings);

router.get("/my-booking", checkAuth(...Object.values(Role)),BookingControllers.getUserBookings);

router.get("/:bookingId",
    checkAuth(...Object.values(Role)),
    BookingControllers.getSingleBooking
)

router.patch("/:bookingId/status",
    checkAuth(...Object.values(Role)),
    validateRequest(updateBookingValidationSchema),
    BookingControllers.updateBookingStatus
);

export const BookingRoutes = router;
