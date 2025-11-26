import { Response } from "express";


export interface AuthTokens{
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
    
    if(tokenInfo.accessToken){
        res.cookie('accessToken', tokenInfo.accessToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
        });
    }
    if(tokenInfo.refreshToken){
        res.cookie('refreshToken', tokenInfo.refreshToken, {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
        });
    }
};

