import { Server,  } from "http";

import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";

let server: Server;



const startServer = async () => {
  try {
 
    await mongoose.connect(
      envVars.MONGODB_URL
    );

    console.log("Connect To DB");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  } finally {
    // mongoose.connection.close();
  }
};
(async() => {
  await startServer();

await seedSuperAdmin();
})()






/*  
* unhandled rejection error 
* uncaught rejection error
* signal termination sigterm 
*/


process.on("unhandledRejection", (reason: Error) => {
  console.error("Unhandled Rejection at:", reason);
    if (server) {
        server.close(() => {
            console.log("Server closed due to unhandled rejection");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }   
});

// Promise.reject(new Error("I forgot to catch this promise"));



process.on("uncaughtException", (err: Error) => {
  console.error("Uncaught Exception thrown:", err); 
    if (server) {
        server.close(() => {
            console.log("Server closed due to uncaught exception");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});
// throw new Error("This is an uncaught exception");


process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully");
    if (server) {
        server.close(() => {
            console.log("Server closed due to SIGTERM");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully");   
    if (server) {
        server.close(() => {
            console.log("Server closed due to SIGINT");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});