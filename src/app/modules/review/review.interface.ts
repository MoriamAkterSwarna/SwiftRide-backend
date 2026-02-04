import { Types } from "mongoose";

export enum ReviewType {
  DRIVER_REVIEW = "driver_review", // Rider reviews driver
  RIDER_REVIEW = "rider_review", // Driver reviews rider
}

export interface IReview {
  rideRequest: Types.ObjectId;
  reviewer: Types.ObjectId; // User who is giving the review
  reviewee: Types.ObjectId; // Driver or Rider being reviewed
  reviewType: ReviewType;
  rating: number; // 1-5
  comment?: string;
  tags?: string[]; // Quick feedback tags like "Clean car", "Polite", "Safe driving"
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: IReview[];
}
