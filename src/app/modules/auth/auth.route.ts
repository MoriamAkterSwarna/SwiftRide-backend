/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post("/login", AuthController.credentialsLogin);

router.post("/refresh-token", AuthController.getNewAccessToken);

router.post("/logout", AuthController.logoutUser);

router.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword,
);

router.post(
  "/set-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword,
);

router.post("/forgot-password", AuthController.forgotPassword);
router.post(
  "/reset-password",
  checkAuth(...Object.values(Role)),
  AuthController.resetPassword,
);

router.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect  || "/";
    passport.authenticate("google", {
      scope: ["email", "profile"],
      state: redirect as string,
    })(req, res, next);
  },
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${envVars.FRONTEND_URL}/login?error=There is some issues with your account. Please contact with out support team!`,
  }),
  AuthController.googleCallbackController,
);

export const AuthRoutes = router;
