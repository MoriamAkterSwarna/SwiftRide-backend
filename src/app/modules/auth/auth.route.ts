/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";


const router = Router(); 

router.post('/login', AuthController.credentialsLogin); 

router.post('/refresh-token', AuthController.getNewAccessToken);

router.post('/logout', AuthController.logoutUser);

router.post('/reset-password',checkAuth(...Object.values(Role)) , AuthController.resetPassword);

router.get('/google', async(req:Request, res: Response, next:NextFunction) => {

    const redirect = req.query.redirect as string || '/';
    passport.authenticate('google', {
        scope: ['email', 'profile'], state: redirect

    })(req, res,next);
});


router.get("/google/callback", passport.authenticate('google', { failureRedirect: '/login' }), AuthController.googleCallbackController);

export const AuthRoutes = router;