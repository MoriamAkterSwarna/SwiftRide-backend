/* eslint-disable @typescript-eslint/no-explicit-any */
import { envVars } from "../../config/env";
import AppError from "../../ErrorHelpers/appError";
import { Payment } from "../payment/payment.model";
import { ISSLCommerz } from "./sslcommerz.interface";
import axios from "axios";
import httpStatus from "http-status-codes";

const sslPaymentInit = async (payload: ISSLCommerz) => {
  try {
    // Validate and format phone number (SSLCommerz expects 11 digit BD number)
    let phoneNumber = payload.phoneNumber?.toString().replace(/\D/g, ''); // Remove non-digits
    if (!phoneNumber || phoneNumber.length < 11) {
      phoneNumber = "01700000000"; // Default fallback
    } else if (phoneNumber.length > 11) {
      phoneNumber = phoneNumber.slice(-11); // Take last 11 digits
    }

    const data = {
      store_id: envVars.SSL.STORE_ID,
      store_passwd: envVars.SSL.STORE_PASS,
      total_amount: payload.amount,
      currency: "BDT",
      tran_id: payload.transactionId,
      success_url: `${envVars.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
      fail_url: `${envVars.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
      cancel_url: `${envVars.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
      ipn_url: envVars.SSL.SSL_IPN_URL,

      shipping_method: "N/A",
      product_name: "Ride Booking",
      product_category: "Service",
      product_profile: "general",
      cus_name: payload.name || "Customer",
      cus_email: payload.email || "customer@example.com",
      cus_add1: payload.address || "Dhaka",
      cus_add2: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: phoneNumber,
      cus_fax: "01711111111",
      ship_name: "N/A",
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: 1000,
      ship_country: "N/A",
    };

    // Convert data to URL-encoded form format
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    console.log("Sending SSLCommerz Request to:", envVars.SSL.SSL_PAYMENT_API);
    console.log("Store ID:", envVars.SSL.STORE_ID);
    console.log("Transaction ID:", payload.transactionId);
    console.log("Amount:", payload.amount);

    const response = await axios({
      method: "POST",
      url: envVars.SSL.SSL_PAYMENT_API,
      data: formData.toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    console.log("SSLCommerz API Response Status:", response.status);
    console.log("SSLCommerz API Response Data:", JSON.stringify(response.data, null, 2));

    if (!response.data) {
      throw new AppError(httpStatus.BAD_REQUEST, "SSLCommerz API returned empty response");
    }

    if (response.data.status === "FAILED") {
      console.error("SSLCommerz Payment Init Failed:", response.data);
      throw new AppError(httpStatus.BAD_REQUEST, response.data.failedreason || "Payment initialization failed");
    }

    return response.data;
  } catch (error: any) {
    console.error("Payment Error Occurred:", error);
    console.error("Error Response Data:", error?.response?.data);
    console.error("Error Message:", error?.message);
    
    const errorMessage = error?.response?.data?.failedreason 
      || error?.response?.data?.message 
      || error?.message 
      || "Payment gateway initialization failed";
    
    throw new AppError(httpStatus.BAD_REQUEST, errorMessage);
  }
};

const validatePayment = async (payload: any) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${envVars.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${envVars.SSL.STORE_ID}&store_passwd=${envVars.SSL.STORE_PASS}`,
    });

    console.log("Payment Validated", response.data);

    await Payment.updateOne(
      {
        transactionId: payload.transactionId,
      },
      { paymentGatewayData: response.data },
      { runValidators: true }
    );
  } catch (error: any) {
    console.log("Payment Error Occured", error);
    throw new AppError(httpStatus.BAD_REQUEST, error.message);
  }
};
export const SSLCommerzService = {
  sslPaymentInit,
  validatePayment,
};
