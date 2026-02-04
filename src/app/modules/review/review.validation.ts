import { z } from "zod";
import { ReviewType } from "./review.interface";

const createReviewValidation = z.object({
  body: z.object({
    rideRequest: z.string({
      required_error: "Ride request ID is required",
    }),
    reviewee: z.string({
      required_error: "Reviewee ID is required",
    }),
    reviewType: z.nativeEnum(ReviewType, {
      required_error: "Review type is required",
    }),
    rating: z
      .number({
        required_error: "Rating is required",
      })
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z
      .string()
      .max(500, "Comment must be less than 500 characters")
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const updateReviewValidation = z.object({
  body: z.object({
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5")
      .optional(),
    comment: z
      .string()
      .max(500, "Comment must be less than 500 characters")
      .optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const ReviewValidation = {
  createReviewValidation,
  updateReviewValidation,
};
