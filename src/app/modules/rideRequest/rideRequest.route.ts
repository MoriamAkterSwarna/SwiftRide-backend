import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { RideRequestControllers } from "./rideRequest.controller";
import { RideRequestValidations } from "./rideRequest.validation";

const router = Router();

// Rider routes
router.post(
  "/request",
  checkAuth(Role.USER, Role.RIDER),
  validateRequest(RideRequestValidations.createRideRequestValidationSchema),
  RideRequestControllers.requestRide,
);

router.post(
  "/estimate-fare",
  checkAuth(Role.USER, Role.RIDER),
  RideRequestControllers.estimateFare,
);

router.patch(
  "/:id/cancel",
  checkAuth(Role.USER, Role.RIDER, Role.DRIVER, Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(RideRequestValidations.cancelRideValidationSchema),
  RideRequestControllers.cancelRide,
);

router.get(
  "/my-history",
  checkAuth(Role.USER, Role.RIDER),
  RideRequestControllers.getMyRideHistory,
);

router.get(
  "/user/active",
  checkAuth(Role.USER, Role.RIDER),
  RideRequestControllers.getUserActiveRideRequests,
);

// Driver routes
router.post(
  "/:requestId/accept",
  checkAuth(Role.DRIVER),
  RideRequestControllers.acceptRide,
);

router.patch(
  "/:id/status",
  checkAuth(Role.DRIVER),
  validateRequest(RideRequestValidations.updateRideStatusValidationSchema),
  RideRequestControllers.updateRideStatus,
);

router.get(
  "/my-rides",
  checkAuth(Role.DRIVER),
  RideRequestControllers.getMyDriverRides,
);

router.get(
  "/available-rides",
  checkAuth(Role.DRIVER),
  RideRequestControllers.getAvailableRides,
);

// Admin routes
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  RideRequestControllers.getAllRideRequests,
);

router.get(
  "/:id",
  checkAuth(Role.USER, Role.RIDER, Role.DRIVER, Role.ADMIN, Role.SUPER_ADMIN),
  RideRequestControllers.getSingleRideRequest,
);

export const RideRequestRoutes = router;
