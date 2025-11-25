
import { UserController } from "./user.controller";

import { createUserZodSchema } from "./user.validation";

import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Router } from "express";


const router = Router();

router.post("/register",validateRequest(createUserZodSchema), UserController.createUser);


  router.get("/all-users",checkAuth("ADMIN", "SUPER_ADMIN"), UserController.getAllUsers);

export const UserRoutes = router;

// export const UserRoutes = router;