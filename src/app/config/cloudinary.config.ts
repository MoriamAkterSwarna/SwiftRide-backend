/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";
import AppError from "../ErrorHelpers/appError";


cloudinary.config({
    
     cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
     api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
     api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
})

export const deleteImageFromCloudinary = async (url: string) => {
try{
     
     const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

        const match = url.match(regex);

        console.log({ match });
 
        if (match && match[1]) {
            const public_id = match[1];
            await cloudinary.uploader.destroy(public_id)
            console.log(`File ${public_id} is deleted from cloudinary`);

        }
}catch(error:any){
     throw new AppError(401, "Failed to delete image from cloudinary", error.message)
}

}


export const cloudinaryUpload = cloudinary