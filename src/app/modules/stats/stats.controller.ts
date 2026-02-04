// controllers/stats.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsService } from "./stats.service";


const getBookingStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getBookingStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Booking stats fetched successfully",
        data: stats,
    });
});

const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getPaymentStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment stats fetched successfully",
        data: stats,
    });
});

const getUserStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getUserStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User stats fetched successfully",
        data: stats,
    });
});

const getRideStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getRideStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride stats fetched successfully",
        data: stats,
    });
});

const getDriverStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getDriverStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Driver stats fetched successfully",
        data: stats,
    });
});

const getReviewStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getReviewStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Review stats fetched successfully",
        data: stats,
    });
});

const getRideRequestStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getRideRequestStats();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride request stats fetched successfully",
        data: stats,
    });
});

const getDashboardOverview = catchAsync(async (req: Request, res: Response) => {
    const stats = await StatsService.getDashboardOverview();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Dashboard overview fetched successfully",
        data: stats,
    });
});

const getRevenueAnalytics = catchAsync(async (req: Request, res: Response) => {
    const period = req.query.period as "daily" | "weekly" | "monthly" || "daily";
    const stats = await StatsService.getRevenueAnalytics(period);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Revenue analytics fetched successfully",
        data: stats,
    });
});

export const StatsController = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getRideStats,
    getDriverStats,
    getReviewStats,
    getRideRequestStats,
    getDashboardOverview,
    getRevenueAnalytics,
};