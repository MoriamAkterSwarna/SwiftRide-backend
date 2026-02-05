import { Types } from "mongoose";

export enum Role{
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    USER = 'USER',
    DRIVER = 'DRIVER',
    RIDER = 'RIDER'
}

export interface IAuthProvider {
    provider :"google" | "credentials" ; // e.g., 'google', 'facebook', 'Credential'
    providerId : string;
}

export enum IsActive{
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED'
}


export interface IUser {

        _id?: Types.ObjectId;
    name : string;
    email: string;
    password?: string;
    phone?: string; 
    picture?: string;
    address?: string;
    isDeleted?: string;
    isActive?: IsActive;
    status?: string;
    isVerified?: boolean;

    role: Role;
    auth : IAuthProvider[];
    rides?: Types.ObjectId[];
    drivers?: Types.ObjectId[];

    createdAt?: Date;

    
}