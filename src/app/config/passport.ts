/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from "bcryptjs";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email: email });
        if (!isUserExist) {
          return done(null, false, { message: "User not found" });
        }

        if (!isUserExist.isVerified) {
          return done(null, false, { message: "User is not verified" });
        }
        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          //   throw new AppError(
          //     httpStatus.UNAUTHORIZED,
          //     `User is ${isUserExist.isActive}`
          //   );

          return done(null, false, {
            message: `User is ${isUserExist.isActive}`,
          });
        }

        if (isUserExist.isDeleted) {
          //   throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted");
          return done(null, false, { message: "User is deleted" });
        }

        const isGoogleAuthenticated = isUserExist.auth?.some(
          (auth) => auth.provider === "google",
        );
        if (isGoogleAuthenticated) {
          return done(null, false, {
            message: "Please log in using Google OAuth",
          });
        }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserExist.password as string,
        );
        if (!isPasswordMatched) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, isUserExist);
      } catch (error) {
        // console.log(error);
        done(error);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(null, false, {
            message: "No email found in Google profile",
          });
        }

        let isUserExist = await User.findOne({ email: email });

        if (isUserExist && !isUserExist.isVerified) {
          return done(null, false, {
            message: "User is not verified",
          });
        }
        if (
          isUserExist &&
          (isUserExist.isActive === IsActive.BLOCKED ||
            isUserExist.isActive === IsActive.INACTIVE)
        ) {
          return done(null, false, {
            message: `User is ${isUserExist.isActive}`,
          });
        }

        if (!isUserExist) {
          isUserExist = await User.create({
            email: email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER,
            isVerified: true,
            auth: [
              {
                provider: "google",
                providerId: profile?.id,
              },
            ],
          });
        }
        return done(null, isUserExist);
      } catch (error) {
        // done(error as Error, undefined);
        // console.log("Google Strategy Error", error);
        done(error as Error, false);
      }
    },
  ),
);

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(
  async (id: string, done: (err: any, user?: any) => void) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  },
);
