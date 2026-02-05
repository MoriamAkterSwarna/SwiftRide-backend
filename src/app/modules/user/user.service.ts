import AppError from "../../ErrorHelpers/appError";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import { Driver } from "../driver/driver.model";
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


  if(decodedToken.role === Role.USER || decodedToken.role === Role.DRIVER){
    if(decodedToken.id !== userId){
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this user");
    }
  }



  const ifUserExist = await User.findById(userId);
  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

    if(decodedToken.role === Role.ADMIN && ifUserExist.role === Role.SUPER_ADMIN){
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this user");
    }
    

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
    // if (decodedToken.role === Role.ADMIN && payload.role === Role.SUPER_ADMIN) {
    //   throw new AppError(
    //     httpStatus.FORBIDDEN,
    //     "You are not authorized to update role to SUPER_ADMIN"
    //   );
    // }
  }
  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decodedToken.role === Role.USER || decodedToken.role === Role.DRIVER) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not authorized to update role"
      );
    }
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

const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return {
    data: user,
  };
};


const getPendingDriverRequests = async () => {
  const requests = await Driver.find({ status: 'pending' })
    .populate('user', '-password')
    .sort({ createdAt: -1 });
  return requests;
}

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

// Block/Unblock user (Admin only)
const blockUser = async (userId: string, adminId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Prevent blocking admins
  if (user.role === Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot block a Super Admin");
  }

  const admin = await User.findById(adminId);
  if (admin?.role === Role.ADMIN && user.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Admin cannot block another Admin");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isActive: IsActive.BLOCKED , status: 'Blocked' },
    { new: true }
  ).select("-password");

  return updatedUser;
};

const unblockUser = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isActive: IsActive.ACTIVE , status: 'Active' },
    { new: true }
  ).select("-password");

  return updatedUser;
};

// Delete user (soft delete)
const deleteUser = async (userId: string, adminId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.role === Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot delete a Super Admin");
  }

  const admin = await User.findById(adminId);
  if (admin?.role === Role.ADMIN && user.role === Role.ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "Admin cannot delete another Admin");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { isDeleted: true, isActive: IsActive.INACTIVE },
    { new: true }
  ).select("-password");

  return updatedUser;
};

export const UserServices = {
  createUser,
  getAllUsers,
  updateUser,
  getSingleUser,
  getMe,
  blockUser,
  unblockUser,
  deleteUser,
  getPendingDriverRequests,
};
