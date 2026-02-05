/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { generateToken, verifyToken } from "../../utils/jwt";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { IAuthProvider, IsActive, IUser, Role } from "../user/user.interface"
import { User } from "../user/user.model";
import  bcryptjs  from 'bcryptjs';
import AppError from "../../ErrorHelpers/appError";
import  httpStatus  from 'http-status-codes';
import { sendEmail } from "../../utils/sendEmail";
import jwt from 'jsonwebtoken';

const credentialsLogin = async(payload: Partial<IUser>) => {
    
    const { email, password } = payload;
    // Add your login logic here (e.g., verify user credentials, generate tokens, etc.)
    // const isUserExist = await User.findOne({ email });
    // if(!isUserExist){
    //     throw new AppError(httpStatus.UNAUTHORIZED, 'User does not exist');
    // }
    // You would typically compare the provided password with the stored hashed password here.
    // const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);
    // if(!isPasswordMatched){
    //     throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid credentials');
    // }

    // const jwtPayload = {
    //   userId: isUserExist._id,
    //   email: isUserExist.email,
    //   role: isUserExist.role,
    // };

    // const accessToken = generateToken(
    //   jwtPayload,
    //   envVars.JWT_ACCESS_SECRET,
    //   envVars.JWT_ACCESS_EXPIRATION
    // );

    // const refreshToken = generateToken(
    //   jwtPayload,
    //   envVars.JWT_REFRESH_SECRET,
    //   envVars.JWT_REFRESH_EXPIRATION
    // );

    // const userTokens = createUserTokens(isUserExist);

 
    // delete isUserExist.password; 

    // const {password: pass , ...rest} = isUserExist.toObject();

    // return {
       
    //     accessToken: userTokens.accessToken,
    //     refreshToken: userTokens.refreshToken,
    //     user: rest,
    // }

}


const getNewAccessToken = async (refreshToken: string) => {

//     const verifyRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

//     if(!verifyRefreshToken){
//         throw new Error('Invalid refresh token');
//     }
 
  
//   const isUserExist = await User.findOne({ email: verifyRefreshToken.email });

//   if (!isUserExist) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "User does not exist");
//   }

 
//   if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
//     throw new AppError(httpStatus.UNAUTHORIZED, `User is ${isUserExist.isActive}`);
//   }

//   if(isUserExist.isDeleted){
//     throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted");
//   }


//  const jwtPayload = {
//    userId: isUserExist._id,
//    email: isUserExist.email,
//    role: isUserExist.role,
//  };

//  const accessToken = generateToken(
//    jwtPayload,
//    envVars.JWT_ACCESS_SECRET,
//    envVars.JWT_ACCESS_EXPIRATION
//  );



//  return {
//    accessToken
//  };



const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);


return {
    accessToken: newAccessToken

};


};

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
  const user = await User.findById(decodedToken.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User does not have a password set"
    );
  }

  const isOldPasswordMatch = await bcryptjs.compare(
    oldPassword,
    user.password as string
  );
  if (!isOldPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password does not match");
  }


  if(user.password === newPassword){
    throw new AppError(httpStatus.BAD_REQUEST, "New Password should be different from old password");
  } 

  user.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  ); 

  await user.save();
}
const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
  if (payload.id != decodedToken.userId) {
        throw new AppError(401, "You can not reset your password")
    }

    const isUserExist = await User.findById(decodedToken.userId)
    if (!isUserExist) {
        throw new AppError(401, "User does not exist")
    }

    const hashedPassword = await bcryptjs.hash(
        payload.newPassword,
        Number(envVars.BCRYPT_SALT_ROUNDS)
    )

    isUserExist.password = hashedPassword;

    await isUserExist.save()
}
const setPassword = async (userId: string, plainPassword: string) => {

  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if(user.password && user.auth.some(providerObject => providerObject.provider === "google") ){
    throw new AppError(httpStatus.BAD_REQUEST, "User already has a password");
  }

  const hashedPassword = await bcryptjs.hash(
    plainPassword,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const credentialProvider: IAuthProvider = {
    provider: "credentials",
    providerId: user.email
  }

  const auth: IAuthProvider[] = [...user.auth, credentialProvider]

  user.password = hashedPassword;
  user.auth = auth;

  await user.save();
  
}

const forgotPassword = async (email: string) => {
  const isUserExist = await User.findOne({ email });

  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  
  // Super admins cannot be blocked
  if (
    isUserExist.role !== Role.SUPER_ADMIN &&
    (isUserExist.isActive === IsActive.BLOCKED ||
      isUserExist.isActive === IsActive.INACTIVE)
  ) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      `User is ${isUserExist.isActive}`
    );
  }
      
          if (isUserExist.isDeleted) {
            throw new AppError(httpStatus.UNAUTHORIZED, "User is deleted");
          }
  
          if( !isUserExist.isVerified){
            throw new AppError(httpStatus.UNAUTHORIZED, "User is not verified");
          }

  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  const resetToken = jwt.sign(
    jwtPayload,
    envVars.JWT_ACCESS_SECRET,
    {
      expiresIn: "10m",
    }
  );

  const resetPasswordLink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`


 sendEmail({
    to: isUserExist.email,
    subject: "Reset Password",
    templateName: "reset-password",
    templateData: {
      name: isUserExist.name,
      resetPasswordLink,
    },
  });
}


export const AuthService = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    resetPassword,
    setPassword,
    forgotPassword
}