import { Request, Response } from "express";

import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DistrictService } from "./district.service";

const createDistrict = catchAsync(async (req: Request, res: Response) => {
    const result = await DistrictService.createDistrict(req.body);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "District created",
        data: result,
    });
});

const getAllDistricts = catchAsync(async (req: Request, res: Response) => {
    const result = await DistrictService.getAllDistricts(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Districts retrieved",
        data: result.data,
        meta: result.meta,
    });
});

const getDistrictsByDivision = catchAsync(async (req: Request, res: Response) => {
    const divisionId = req.params.divisionId;
    const result = await DistrictService.getDistrictsByDivision(divisionId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Districts retrieved by division",
        data: result.data,
    });
});

const getSingleDistrict = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug
    const result = await DistrictService.getSingleDistrict(slug);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "District retrieved",
        data: result.data,
    });
});

const updateDistrict = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;

    const result = await DistrictService.updateDistrict(id, req.body);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "District updated",
        data: result,
    });
});

const deleteDistrict = catchAsync(async (req: Request, res: Response) => {
    const result = await DistrictService.deleteDistrict(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "District deleted",
        data: result,
    });
});

export const DistrictController = {
    createDistrict,
    getAllDistricts,
    getDistrictsByDivision,
    getSingleDistrict,
    updateDistrict,
    deleteDistrict,
};
