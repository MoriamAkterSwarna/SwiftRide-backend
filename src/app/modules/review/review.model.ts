import { model, Schema } from "mongoose";
import { IReview, ReviewType } from "./review.interface";

const reviewSchema = new Schema<IReview>(
  {
    rideRequest: {
      type: Schema.Types.ObjectId,
      ref: "RideRequest",
      required: true,
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewType: {
      type: String,
      enum: Object.values(ReviewType),
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to ensure one review per ride per reviewer
reviewSchema.index({ rideRequest: 1, reviewer: 1, reviewType: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ reviewee: 1, reviewType: 1 });
reviewSchema.index({ createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);
