import { envVars } from "../config/env";
import {
  IAuthProvider,
  IsActive,
  IUser,
  Role,
} from "../modules/user/user.interface";
import { User } from "../modules/user/user.model";
import bcryptjs from "bcryptjs";

export const seedSuperAdmin = async () => {
  try {
    const adminEmail = envVars.SUPER_ADMIN_EMAIL.toLowerCase();
    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUNDS),
    );

    const isSuperAdminExist = await User.findOne({ email: adminEmail });

    if (isSuperAdminExist) {
      await User.findOneAndUpdate(
        { email: adminEmail },
        {
          password: hashedPassword,
          role: Role.SUPER_ADMIN,
          isVerified: true,
          isActive: IsActive.ACTIVE,
        },
      );
      console.log("Super Admin credentials updated from .env");
      return;
    }

    const authProvider: IAuthProvider = {
      provider: "credentials",
      providerId: adminEmail,
    };

    const payload: IUser = {
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      auth: [authProvider],
      isVerified: true,
      isActive: IsActive.ACTIVE,
    };

    const superAdmin = await User.create(payload);

    console.log("Super Admin created successfully:", superAdmin.email);
  } catch (error) {
    console.log(error);
  }
};
