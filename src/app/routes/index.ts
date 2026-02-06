import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { DivisionRoutes } from "../modules/division/division.route";
import { DistrictRoutes } from "../modules/district/district.route";
import { RideRoutes } from "../modules/ride/ride.route";
import { BookingRoutes } from "../modules/booking/booking.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { StatsRoutes } from "../modules/stats/stats.route";
import { DriverRoutes } from "../modules/driver/driver.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { FareEstimationRoutes } from "../modules/fareEstimation/fareEstimation.route";
import { DriverLocationRoutes } from "../modules/driverLocation/driverLocation.route";

export const router = Router();
const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/division",
    route: DivisionRoutes,
  },
  {
    path: "/district",
    route: DistrictRoutes,
  },
  {
    path: "/ride",
    route: RideRoutes,
  },
  {
    path: "/booking",
    route: BookingRoutes,
  },
  {
    path: "/payment",
    route: PaymentRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
  {
    path: "/stats",
    route: StatsRoutes,
  },
  {
    path: "/driver",
    route: DriverRoutes,
  },
  // {
  //   path: "/ride-request",
  //   route: RideRequestRoutes,
  // },
  {
    path: "/review",
    route: ReviewRoutes,
  },
  {
    path: "/fare",
    route: FareEstimationRoutes,
  },
  {
    path: "/driver-location",
    route: DriverLocationRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// export default router
