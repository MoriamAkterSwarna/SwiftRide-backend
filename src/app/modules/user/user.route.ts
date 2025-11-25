import { Router } from "express";
import { UserController } from "./user.controller";

import { createUserZodSchema } from "./user.validation";
import { validateRequest } from "../../middlewares/validaterequest";



const router = Router();

router.post("/register",validateRequest(createUserZodSchema), UserController.createUser);


router.get("/all-users", UserController.getAllUsers);

export const UserRoutes = router;

// export const UserRoutes = router;