
import { UserController } from "./user.controller";

import { createUserZodSchema } from "./user.validation";

import { validateRequest } from "../../middlewares/validateRequest";
import { checkAuth } from "../../middlewares/checkAuth";
import { Router } from "express";
import { Role } from "./user.interface";


const router = Router();

router.post("/register",validateRequest(createUserZodSchema), UserController.createUser);


router.get("/all-users",checkAuth(Role.ADMIN , Role.SUPER_ADMIN), UserController.getAllUsers);

router.get(
  "/driver-requests",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  UserController.getPendingDriverRequests
);

router.get("/me",checkAuth(...Object.values(Role)), UserController.getMe);

router.patch("/:id",checkAuth(...Object.values(Role)), UserController.updateUser);



// Block/Unblock user (Admin only)
router.patch("/:id/block", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.blockUser);
router.patch("/:id/unblock", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.unblockUser);



// Delete user (Admin only)
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.deleteUser);

router.get("/:id",checkAuth(Role.ADMIN , Role.SUPER_ADMIN), UserController.getSingleUser);
  
export const UserRoutes = router;