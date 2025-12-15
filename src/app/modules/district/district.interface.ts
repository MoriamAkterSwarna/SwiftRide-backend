import { Types } from "mongoose";

export interface IDistrict {
    name: string;
    slug: string;
    division: Types.ObjectId;  
    thumbnail?: string;
    description?: string;
}