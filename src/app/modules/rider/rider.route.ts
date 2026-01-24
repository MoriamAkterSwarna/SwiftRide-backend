import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { RiderControllers } from "./rider.controller";
import { RiderValidations } from "./rider.validation";

const router = Router();

router.post(
  "/create-rider",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
  validateRequest(RiderValidations.createRiderValidationSchema),
  RiderControllers.createRider,
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  RiderControllers.getAllRiders,
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.RIDER, Role.DRIVER),
  RiderControllers.getSingleRider,
);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(RiderValidations.updateRiderValidationSchema),
  RiderControllers.updateRider,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  RiderControllers.deleteRider,
);

export const RiderRoutes = router;
