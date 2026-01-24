import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { DistrictController } from "./district.controller";
import {
    createDistrictSchema,
    updateDistrictSchema,
} from "./district.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router()

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("thumbnail"),
    validateRequest(createDistrictSchema),
    DistrictController.createDistrict
);
router.get("/", DistrictController.getAllDistricts);
router.get("/division/:divisionId", DistrictController.getDistrictsByDivision);
router.get("/:slug", DistrictController.getSingleDistrict)
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.single("thumbnail"),
    validateRequest(updateDistrictSchema),
    DistrictController.updateDistrict
);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DistrictController.deleteDistrict);

export const DistrictRoutes = router
