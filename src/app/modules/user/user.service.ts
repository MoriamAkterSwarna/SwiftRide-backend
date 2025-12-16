import AppError from "../../ErrorHelpers/appError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>): Promise<IUser> => {
  const { email, password, ...rest } = payload;
  //   const user = await User.create({  email, ...rest});

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUNDS)
  );

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "User already exists");
  }

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  const user = await User.create({
    email,
    password: hashedPassword,
    auth: [authProvider],
    ...rest,
  });

  return user;
};

const updateUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: JwtPayload
) => {
  const ifUserExist = await User.findById(userId);
  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // if(ifUserExist.isDeleted){
  //   throw new AppError(httpStatus.BAD_REQUEST, 'User is deleted. Cannot update deleted user');
  // }

  // if(ifUserExist.isActive === IsActive.BLOCKED ){
  //   throw new AppError(httpStatus.BAD_REQUEST, 'User is deactivated. Cannot update deactivated user');
  // }

  /*
  * email can not be updated
  * only user himself or admin can update the user
  * if password is being updated, hash the new password
  * name, phone, password,address can be updated
  * role can only be updated by admin or super admin
  
  */

  if (payload.role) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.DRIVER) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update role"
      );
    }
    if (decodedToken.role === Role.ADMIN && payload.role === Role.SUPER_ADMIN) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update role to SUPER_ADMIN"
      );
    }
  }
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.DRIVER) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update role"
      );
    }
  }

  if (payload.password) {
    payload.password = await bcryptjs.hash(
      payload.password as string,
      Number(envVars.BCRYPT_SALT_ROUNDS)
    );
  }

  const newUpdateUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return newUpdateUser;
};

const getAllUsers = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(User.find(), query);

  const result = queryBuilder
    .search(userSearchableFields)
    .filter()
    .sort()
    .fields()
    .pagination();

  const [data, meta] = await Promise.all([
    result.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    data,
    meta,
  };
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
};
