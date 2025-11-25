import AppError from "../../ErrorHelpers/appError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import  httpStatus  from 'http-status-codes';
import bcryptjs from 'bcryptjs';


const createUser = async(payload : Partial<IUser>) : Promise<IUser> => {

     const {  email ,password,  ...rest} = payload;
    //   const user = await User.create({  email, ...rest});

    const hashedPassword = await bcryptjs.hash(password as string, 10);

    const isPasswordMatched = await bcryptjs.compare(password as string, hashedPassword);
    // This should log 'true'




      const isUserExist = await User.findOne({ email });
      if(isUserExist){
        throw new AppError(httpStatus.CONFLICT, 'User already exists');
      }


      const authProvider:IAuthProvider = {
        provider: 'credentials',
        providerId: email as string
      };


        const user = await User.create({ email,
            password: hashedPassword,
            auth: [authProvider],
            ...rest});

      return user;
}

const getAllUsers = async()  => {
    const users = await User.find({});

    const totalUsers = await User.countDocuments();
    return{
        data : users,
        meta : {
            total: totalUsers
        }
    }
}


export const UserServices = {
    createUser,
    getAllUsers
}

