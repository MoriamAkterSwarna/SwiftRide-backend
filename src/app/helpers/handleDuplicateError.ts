/* eslint-disable @typescript-eslint/no-explicit-any */
import { TGenericErrorResponse } from "../interfaces/error.types";

export const handleDuplicateError = (err: any): TGenericErrorResponse => {
    const duplicate = err.message.match(/"([^"]*)"/);

    return {
        statusCode: 400,
        message: `Duplicate value entered for ${duplicate ? duplicate[1] : 'field'}. Please choose another value!`,
    }
}