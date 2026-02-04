import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { StatsController } from "./stats.controller";


const router = express.Router();

// Dashboard overview - comprehensive snapshot
router.get(
    "/dashboard",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getDashboardOverview
);

// Revenue analytics with period filter
router.get(
    "/revenue",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getRevenueAnalytics
);

router.get(
    "/booking",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getBookingStats
);
router.get(
    "/payment",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getPaymentStats
);
router.get(
    "/user",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getUserStats
);
router.get(
    "/ride",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getRideStats
);
router.get(
    "/driver",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getDriverStats
);
router.get(
    "/review",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getReviewStats
);
router.get(
    "/ride-request",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    StatsController.getRideRequestStats
);

export const StatsRoutes = router;