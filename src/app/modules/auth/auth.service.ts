/* eslint-disable @typescript-eslint/no-unused-vars */
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { generateToken, verifyToken } from "../../utils/jwt";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { IsActive, IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import  bcryptjs  from 'bcryptjs';
import AppError from "../../ErrorHelpers/appError";
import  httpStatus  from 'http-status-codes';


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

const resetPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
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

  user.password = await bcryptjs.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  await user.save();
}


export const AuthService = {
    credentialsLogin,
    getNewAccessToken,
    resetPassword,
}