import dotenv from 'dotenv'; 

dotenv.config();

interface EnvConfig {
    PORT: string ;
    MONGODB_URL: string ;
    NODE_ENV: string ;
}
const loadEnv = () :EnvConfig => {
    const requiredVars = ['PORT', 'MONGODB_URL', 'NODE_ENV'];

    
    requiredVars.forEach((varName) => {
        if (!process.env[varName]) {
            throw new Error(`Environment variable ${varName} is not set`);
        }
    });


    return {
      PORT: process.env.PORT as string,
      MONGODB_URL: process.env.MONGODB_URL as string,
      NODE_ENV: process.env.NODE_ENV as string,
    };
}

export const envVars: EnvConfig = loadEnv();