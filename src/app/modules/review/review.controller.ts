import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewServices } from "./review.service";
import { ReviewType } from "./review.interface";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const result = await ReviewServices.createReviewIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.getAllReviewsFromDB(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getDriverReviews = catchAsync(async (req: Request, res: Response) => {
  const { driverId } = req.params;
  const result = await ReviewServices.getReviewsByUser(
    driverId,
    ReviewType.DRIVER_REVIEW,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver reviews fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getRiderReviews = catchAsync(async (req: Request, res: Response) => {
  const { riderId } = req.params;
  const result = await ReviewServices.getReviewsByUser(
    riderId,
    ReviewType.RIDER_REVIEW,
    req.query,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rider reviews fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getDriverReviewStats = catchAsync(async (req: Request, res: Response) => {
  const { driverId } = req.params;
  const result = await ReviewServices.getDriverReviewStats(driverId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Driver review stats fetched successfully",
    data: result,
  });
});

const getRiderReviewStats = catchAsync(async (req: Request, res: Response) => {
  const { riderId } = req.params;
  const result = await ReviewServices.getRiderReviewStats(riderId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rider review stats fetched successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const { reviewId } = req.params;
  const result = await ReviewServices.updateReviewIntoDB(
    reviewId,
    userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const userId = user.userId;
  const { reviewId } = req.params;
  await ReviewServices.deleteReviewFromDB(reviewId, userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getDriverReviews,
  getRiderReviews,
  getDriverReviewStats,
  getRiderReviewStats,
  updateReview,
  deleteReview,
};
