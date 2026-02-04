import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { DriverLocationController } from "./driverLocation.controller";
import { DriverLocationValidation } from "./driverLocation.validation";

const router = express.Router();

// Update driver location (driver only)
router.put(
  "/update",
  checkAuth(Role.DRIVER),
  validateRequest(DriverLocationValidation.updateLocationValidation),
  DriverLocationController.updateLocation,
);

// Set driver online/offline status
router.patch(
  "/status",
  checkAuth(Role.DRIVER),
  DriverLocationController.setOnlineStatus,
);

// Find nearby drivers (authenticated users)
router.post(
  "/nearby",
  checkAuth(Role.USER, Role.RIDER),
  validateRequest(DriverLocationValidation.findNearbyDriversValidation),
  DriverLocationController.findNearbyDrivers,
);

// Get specific driver location
router.get(
  "/:driverId",
  checkAuth(Role.USER, Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN),
  DriverLocationController.getDriverLocation,
);

// Get online drivers count (public)
router.get(
  "/online/count",
  DriverLocationController.getOnlineDriversCount,
);

// Get drivers in a specific area (for map view)
router.post(
  "/area",
  checkAuth(Role.USER, Role.RIDER, Role.ADMIN, Role.SUPER_ADMIN),
  DriverLocationController.getDriversInArea,
);

// Remove driver location (driver only)
router.delete(
  "/",
  checkAuth(Role.DRIVER),
  DriverLocationController.removeLocation,
);

export const DriverLocationRoutes = router;
