/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response } from "express";
import { envVars } from "../config/env";


export interface AuthTokens{
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    
    if(tokenInfo.accessToken){
        res.cookie('accessToken', tokenInfo.accessToken, {
            httpOnly: true,
            // secure: false, // Set to true if using HTTPS 

            secure: true, 
            sameSite: "none",
            
        });
    }
    if(tokenInfo.refreshToken){
        res.cookie('refreshToken', tokenInfo.refreshToken, {
            httpOnly: true,
            secure: true, 
            sameSite: "none",
        });
    }
};

