/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RideService } from "./ride.service";
import { IRide } from "./ride.interface";

// RideType Controllers
const createRideType = catchAsync(async (req: Request, res: Response) => {
    const result = await RideService.createRideType(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Ride type created",
        data: result,
    });
});

const getAllRideTypes = catchAsync(async (req: Request, res: Response) => {
    const result = await RideService.getAllRideTypes();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride types retrieved",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleRideType = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await RideService.getSingleRideType(id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride type retrieved",
        data: result.data,
    });
});

const updateRideType = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await RideService.updateRideType(id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride type updated",
        data: result,
    });
});

const deleteRideType = catchAsync(async (req: Request, res: Response) => {
    const result = await RideService.deleteRideType(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride type deleted",
        data: result,
    });
});

// Ride Controllers
const createRide = catchAsync(async (req: Request, res: Response) => {

    console.log({
        files : req.files,
        body : req.body
    })

    const payload : IRide = {
        ...req.body,
        images : (req.files as Express.Multer.File[])?.map((file : any) => file.path)
    }
    const result = await RideService.createRide(payload);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Ride created",
        data: result,
    });
});

const getAllRides = catchAsync(async (req: Request, res: Response) => {

    const query = req.query;
    const result = await RideService.getAllRides(query as Record<string, string>);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rides retrieved",
        data: result.data,
        meta: result.meta,
    });
});

const getRidesByDivision = catchAsync(async (req: Request, res: Response) => {
    const divisionId = req.params.divisionId;
    const result = await RideService.getRidesByDivision(divisionId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rides retrieved by division",
        data: result.data,
    });
});

const getRidesByDistrict = catchAsync(async (req: Request, res: Response) => {
    const districtId = req.params.districtId;
    const result = await RideService.getRidesByDistrict(districtId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rides retrieved by district",
        data: result.data,
    });
});

const getRidesByStatus = catchAsync(async (req: Request, res: Response) => {
    const status = req.params.status;
    const result = await RideService.getRidesByStatus(status);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Rides retrieved by status",
        data: result.data,
    });
});

const getSingleRide = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await RideService.getSingleRide(slug);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride retrieved",
        data: result.data,
    });
});

const updateRide = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await RideService.updateRide(id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride updated",
        data: result,
    });
});

const deleteRide = catchAsync(async (req: Request, res: Response) => {
    const result = await RideService.deleteRide(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Ride deleted",
        data: result,
    });
});

export const RideController = {
    // RideType controllers
    createRideType,
    getAllRideTypes,
    getSingleRideType,
    updateRideType,
    deleteRideType,
    
    // Ride controllers
    createRide,
    getAllRides,
    getRidesByDivision,
    getRidesByDistrict,
    getRidesByStatus,
    getSingleRide,
    updateRide,
    deleteRide,
};
