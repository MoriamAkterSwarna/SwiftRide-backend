import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { DriverControllers } from "./driver.controller";
import { DriverValidations } from "./driver.validation";

const router = Router();

// Driver self routes
router.get(
  "/me",
  checkAuth(Role.DRIVER),
  DriverControllers.getMyDriverProfile,
);

router.get(
  "/my-earnings",
  checkAuth(Role.DRIVER),
  DriverControllers.getMyEarnings,
);

router.patch(
  "/availability/toggle",
  checkAuth(Role.DRIVER),
  DriverControllers.toggleAvailability,
);

// User can apply to become driver
router.post(
  "/create-driver",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  validateRequest(DriverValidations.createDriverValidationSchema),
  DriverControllers.createDriver,
);

// Admin routes
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.getAllDrivers,
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DRIVER),
  DriverControllers.getSingleDriver,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(DriverValidations.updateDriverValidationSchema),
  DriverControllers.updateDriver,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.deleteDriver,
);

// Admin: Approve/Reject/Suspend drivers
router.patch(
  "/:id/approve",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.approveDriver,
);

router.patch(
  "/:id/reject",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.rejectDriver,
);

router.patch(
  "/:id/suspend",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.suspendDriver,
);

router.patch(
  "/:id/reactivate",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DriverControllers.reactivateDriver,
);

export const DriverRoutes = router;
