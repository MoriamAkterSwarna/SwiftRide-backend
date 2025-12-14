import mongoose from "mongoose"
import { TGenericErrorResponse } from "../interfaces/error.types"

export const handleCastError = (err: mongoose.Error.CastError): TGenericErrorResponse => {
    return {
        statusCode: 400,
        message: `Invalid MongoDB ObjectID. Profile not found with id: ${err.value}`,
    }
}