import dotenv from 'dotenv'; 

dotenv.config();

interface EnvConfig {
  PORT: string;
  MONGODB_URL: string;
  NODE_ENV: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  BCRYPT_SALT_ROUNDS: string;
  SUPER_ADMIN_EMAIL: string;
  SUPER_ADMIN_PASSWORD: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRATION: string;
}
const loadEnv = () :EnvConfig => {
    const requiredVars = ['PORT', 'MONGODB_URL', 'NODE_ENV', 'JWT_ACCESS_SECRET', 'JWT_ACCESS_EXPIRATION', 'BCRYPT_SALT_ROUNDS', 'SUPER_ADMIN_EMAIL', 'SUPER_ADMIN_PASSWORD', 'JWT_REFRESH_SECRET', 'JWT_REFRESH_EXPIRATION'];

    
    requiredVars.forEach((varName) => {
        if (!process.env[varName]) {
            throw new Error(`Environment variable ${varName} is not set`);
        }
    });


    return {
      PORT: process.env.PORT as string,
      MONGODB_URL: process.env.MONGODB_URL as string,
      NODE_ENV: process.env.NODE_ENV as string,
        JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
        JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION as string,
        BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
        SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
        SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
        JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,
    };
}

export const envVars: EnvConfig = loadEnv();