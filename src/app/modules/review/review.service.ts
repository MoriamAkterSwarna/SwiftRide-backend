import httpStatus from "http-status-codes";
import AppError from "../../ErrorHelpers/appError";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Driver } from "../driver/driver.model";
import { RideRequest } from "../rideRequest/rideRequest.model";
import { RideRequestStatus } from "../rideRequest/rideRequest.interface";
import { reviewSearchableFields } from "./review.constant";
import { IReview, ReviewType } from "./review.interface";
import { Review } from "./review.model";

const createReviewIntoDB = async (userId: string, payload: IReview) => {
  // Check if ride request exists and is completed
  const rideRequest = await RideRequest.findById(payload.rideRequest);
  if (!rideRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Ride request not found");
  }

  if (rideRequest.status !== RideRequestStatus.COMPLETED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Can only review completed rides",
    );
  }

  // Validate that the reviewer is part of this ride
  const isRider = rideRequest.rider.toString() === userId;
  const isDriver = rideRequest.driver?.toString() === userId;

  if (!isRider && !isDriver) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to review this ride",
    );
  }

  // Validate review type matches the reviewer's role
  if (payload.reviewType === ReviewType.DRIVER_REVIEW && !isRider) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only riders can submit driver reviews",
    );
  }

  if (payload.reviewType === ReviewType.RIDER_REVIEW && !isDriver) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only drivers can submit rider reviews",
    );
  }

  // Check if review already exists
  const existingReview = await Review.findOne({
    rideRequest: payload.rideRequest,
    reviewer: userId,
    reviewType: payload.reviewType,
  });

  if (existingReview) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already reviewed this ride",
    );
  }

  // Create review
  const review = await Review.create({
    ...payload,
    reviewer: userId,
  });

  // Update driver rating if it's a driver review
  if (payload.reviewType === ReviewType.DRIVER_REVIEW) {
    await updateDriverRating(payload.reviewee.toString());
  }

  return review;
};

const updateDriverRating = async (driverUserId: string) => {
  const reviews = await Review.find({
    reviewee: driverUserId,
    reviewType: ReviewType.DRIVER_REVIEW,
  });

  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Driver.findOneAndUpdate(
      { user: driverUserId },
      { rating: Math.round(averageRating * 10) / 10 },
    );
  }
};

const getAllReviewsFromDB = async (query: Record<string, unknown>) => {
  const reviewQuery = new QueryBuilder(
    Review.find()
      .populate("reviewer", "name picture")
      .populate("reviewee", "name picture")
      .populate("rideRequest"),
    query as Record<string, string>,
  )
    .search(reviewSearchableFields)
    .filter()
    .sort()
    .pagination()
    .fields();

  const [data, meta] = await Promise.all([
    reviewQuery.build(),
    reviewQuery.getMeta(),
  ]);

  return { meta, data };
};

const getReviewsByUser = async (
  userId: string,
  reviewType: ReviewType,
  query: Record<string, unknown>,
) => {
  const reviewQuery = new QueryBuilder(
    Review.find({ reviewee: userId, reviewType })
      .populate("reviewer", "name picture")
      .populate("rideRequest"),
    query as Record<string, string>,
  )
    .filter()
    .sort()
    .pagination();

  const [data, meta] = await Promise.all([
    reviewQuery.build(),
    reviewQuery.getMeta(),
  ]);

  return { meta, data };
};

const getDriverReviewStats = async (driverUserId: string) => {
  const reviews = await Review.find({
    reviewee: driverUserId,
    reviewType: ReviewType.DRIVER_REVIEW,
  }).sort({ createdAt: -1 });

  if (reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentReviews: [],
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    ratingDistribution[rating]++;
  });

  const recentReviews = await Review.find({
    reviewee: driverUserId,
    reviewType: ReviewType.DRIVER_REVIEW,
  })
    .populate("reviewer", "name picture")
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    recentReviews,
  };
};

const getRiderReviewStats = async (riderUserId: string) => {
  const reviews = await Review.find({
    reviewee: riderUserId,
    reviewType: ReviewType.RIDER_REVIEW,
  }).sort({ createdAt: -1 });

  if (reviews.length === 0) {
    return {
      averageRating: 5.0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentReviews: [],
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((review) => {
    const rating = review.rating as 1 | 2 | 3 | 4 | 5;
    ratingDistribution[rating]++;
  });

  const recentReviews = await Review.find({
    reviewee: riderUserId,
    reviewType: ReviewType.RIDER_REVIEW,
  })
    .populate("reviewer", "name picture")
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    averageRating,
    totalReviews: reviews.length,
    ratingDistribution,
    recentReviews,
  };
};

const updateReviewIntoDB = async (
  reviewId: string,
  userId: string,
  payload: Partial<IReview>,
) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.reviewer.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to update this review",
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(
    reviewId,
    { rating: payload.rating, comment: payload.comment, tags: payload.tags },
    { new: true, runValidators: true },
  );

  // Update driver rating if needed
  if (
    payload.rating !== undefined &&
    review.reviewType === ReviewType.DRIVER_REVIEW
  ) {
    await updateDriverRating(review.reviewee.toString());
  }

  return updatedReview;
};

const deleteReviewFromDB = async (reviewId: string, userId: string) => {
  const review = await Review.findById(reviewId);
  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  if (review.reviewer.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not authorized to delete this review",
    );
  }

  await Review.findByIdAndDelete(reviewId);

  // Update driver rating if needed
  if (review.reviewType === ReviewType.DRIVER_REVIEW) {
    await updateDriverRating(review.reviewee.toString());
  }

  return null;
};

export const ReviewServices = {
  createReviewIntoDB,
  getAllReviewsFromDB,
  getReviewsByUser,
  getDriverReviewStats,
  getRiderReviewStats,
  updateReviewIntoDB,
  deleteReviewFromDB,
};
