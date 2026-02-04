import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { FareEstimationController } from "./fareEstimation.controller";
import { FareEstimationValidation } from "./fareEstimation.validation";

const router = express.Router();

// Estimate fare (public endpoint)
router.post(
  "/estimate",
  validateRequest(FareEstimationValidation.estimateFareValidation),
  FareEstimationController.estimateFare,
);

// Get all fare configurations (admin only)
router.get(
  "/config",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  FareEstimationController.getAllFareConfigs,
);

// Update fare configuration (admin only)
router.patch(
  "/config/:vehicleType",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(FareEstimationValidation.updateFareConfigValidation),
  FareEstimationController.updateFareConfig,
);

export const FareEstimationRoutes = router;
