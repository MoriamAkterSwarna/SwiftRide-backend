import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { RideController } from "./ride.controller";
import {
    createRideTypeSchema,
    updateRideTypeSchema,
    createRideSchema,
    updateRideSchema,
} from "./ride.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// RideType Routes
router.post(
    "/ride-type/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createRideTypeSchema),
    RideController.createRideType
);
router.get("/ride-type", RideController.getAllRideTypes);
router.get("/ride-type/:id", RideController.getSingleRideType);
router.patch(
    "/ride-type/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateRideTypeSchema),
    RideController.updateRideType
);
router.delete(
    "/ride-type/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    RideController.deleteRideType
);

// Ride Routes
router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
    multerUpload.array("files"),
    validateRequest(createRideSchema),
    RideController.createRide
);
router.get("/", RideController.getAllRides);
router.get("/division/:divisionId", RideController.getRidesByDivision);
router.get("/district/:districtId", RideController.getRidesByDistrict);
router.get("/status/:status", RideController.getRidesByStatus);
router.get("/:slug", RideController.getSingleRide);
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
    multerUpload.array("files"),
    validateRequest(updateRideSchema),
    RideController.updateRide
);
router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.USER),
    RideController.deleteRide
);

export const RideRoutes = router;
