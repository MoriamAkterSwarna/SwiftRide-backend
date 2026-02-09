import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentServices } from "./payment.service";
import { envVars } from "../../config/env";
import { SSLCommerzService } from "../sslcommerz/sslcommerz.service";
import { JwtPayload } from 'jsonwebtoken';


const initPayment = catchAsync(async (req: Request, res: Response) => {

    const rideId = req.params.rideId;

    const result = await PaymentServices.initPayment(rideId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment done successfully",
        data: result,
    });
});
const successPayment = catchAsync(async (req: Request, res: Response) => {

    const query = req.query;

    const result = await PaymentServices.successPayment(query as Record<string, string>);

    if(result.success){
     
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment success",
        data: result,
    });
});


const getInvoiceDownloadUrl = catchAsync(async (req: Request, res: Response) => {

    const paymentId = req.params.paymentId;

    const result = await PaymentServices.getInvoiceDownloadUrl(paymentId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Invoice download url",
        data: result,
    });
});
const failPayment = catchAsync(async (req: Request, res: Response) => {


     const query = req.query;

    const result = await PaymentServices.failPayment(query as Record<string, string>);

    if(!result.success){
     
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment failed",
        data: {},
    });
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {

 const query = req.query;

    const result = await PaymentServices.cancelPayment(query as Record<string, string>);

    if(!result.success){
     
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment cancelled",
        data: {},
    });
});

const validatePayment = catchAsync(
    async (req: Request, res: Response) => {
        console.log("sslcommerz ipn url body", req.body);
        await SSLCommerzService.validatePayment(req.body)
        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Payment Validated Successfully",
            data: null,
        });
    }
);

const getPaymentHistory = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await PaymentServices.getPaymentHistory(user.userId);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Payment history fetched successfully",
        data: result,
    });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const result = await PaymentServices.getAllPayments();
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "All payments fetched successfully",
        data: result,
    });
});

export const PaymentController = {
    initPayment,
    successPayment,
    getInvoiceDownloadUrl,
    failPayment,
    cancelPayment,
    validatePayment,
    getPaymentHistory,
    getAllPayments
};
