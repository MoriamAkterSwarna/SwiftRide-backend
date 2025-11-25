import { IUser } from "../user/user.interface"
import { User } from "../user/user.model";
import  bcryptjs  from 'bcryptjs';

const credentialsLogin = async(payload: Partial<IUser>) => {
    
    const { email, password } = payload;
    // Add your login logic here (e.g., verify user credentials, generate tokens, etc.)
    const isUserExist = await User.findOne({ email });
    if(!isUserExist){
        throw new Error('User does not exist');
    }
    // You would typically compare the provided password with the stored hashed password here.
    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string);
    if(!isPasswordMatched){
        throw new Error('Invalid credentials');
    }

    
    return {
        email : isUserExist.email,
    }

}

export const AuthService = {
    credentialsLogin
}