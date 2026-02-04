import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { ReviewController } from "./review.controller";
import { ReviewValidation } from "./review.validation";

const router = express.Router();

// Create a review (authenticated users)
router.post(
  "/",
  checkAuth(Role.USER, Role.RIDER, Role.DRIVER),
  validateRequest(ReviewValidation.createReviewValidation),
  ReviewController.createReview,
);

// Get all reviews (admin only)
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  ReviewController.getAllReviews,
);

// Get driver reviews
router.get("/driver/:driverId", ReviewController.getDriverReviews);

// Get driver review stats
router.get("/driver/:driverId/stats", ReviewController.getDriverReviewStats);

// Get rider reviews (drivers can see rider reviews)
router.get(
  "/rider/:riderId",
  checkAuth(Role.DRIVER, Role.ADMIN, Role.SUPER_ADMIN),
  ReviewController.getRiderReviews,
);

// Get rider review stats
router.get(
  "/rider/:riderId/stats",
  checkAuth(Role.DRIVER, Role.ADMIN, Role.SUPER_ADMIN),
  ReviewController.getRiderReviewStats,
);

// Update a review
router.patch(
  "/:reviewId",
  checkAuth(Role.USER, Role.RIDER, Role.DRIVER),
  validateRequest(ReviewValidation.updateReviewValidation),
  ReviewController.updateReview,
);

// Delete a review
router.delete(
  "/:reviewId",
  checkAuth(Role.USER, Role.RIDER, Role.DRIVER),
  ReviewController.deleteReview,
);

export const ReviewRoutes = router;
