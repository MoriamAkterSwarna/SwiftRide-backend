/* eslint-disable no-useless-escape */
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";


const storage = new CloudinaryStorage({
    cloudinary: cloudinaryUpload,
    params: {
        public_id: (req, file) => {

            const filename = file.originalname.toLowerCase().replace(/\s+/g, "-").
            replace(/[^a-z0-9\-\.]/g, "")

            const extension = file.originalname.split(".").pop();

            const uniqueFilename = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + filename + "." + extension;

            return uniqueFilename;


        }
    }
})

export const multerUpload = multer({ storage:storage });