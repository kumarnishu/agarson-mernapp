import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AssignCRMCitiesToUsers, BulkCreateAndUpdateCRMCityFromExcel, CreateCRMCity, DeleteCRMCity, FindUnknownCrmCities, GetAllCRMCities, UpdateCRMCity } from "../controllers/lead.controller";
import { upload } from ".";
const router = express.Router()

router.route("/crm/cities").get(isAuthenticatedUser, GetAllCRMCities).post(isAuthenticatedUser, CreateCRMCity)
router.route("/crm/cities/:id").put(isAuthenticatedUser, UpdateCRMCity).delete(isAuthenticatedUser, DeleteCRMCity),
    router.route("/crm/cities/excel/createorupdate/:state").put(isAuthenticatedUser, upload.single('file'), BulkCreateAndUpdateCRMCityFromExcel)
router.patch("/crm/cities/assign", isAuthenticatedUser, AssignCRMCitiesToUsers)
router.route("/find/crm/cities/unknown").post(isAuthenticatedUser, FindUnknownCrmCities);

export default router