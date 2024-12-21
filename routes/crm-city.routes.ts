import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { AuthorizationController } from "../controllers/AuthorizationController";
let controller = new AuthorizationController()
const router = express.Router()

router.route("/crm/cities").get(isAuthenticatedUser, controller.GetAllCRMCities).post(isAuthenticatedUser, controller.CreateCRMCity)
router.route("/crm/cities/:id").put(isAuthenticatedUser, controller.UpdateCRMCity).delete(isAuthenticatedUser, controller.DeleteCRMCity),
    router.route("/crm/cities/excel/createorupdate/:state").put(isAuthenticatedUser, upload.single('file'), controller.BulkCreateAndUpdateCRMCityFromExcel)
router.patch("/crm/cities/assign", isAuthenticatedUser, controller.AssignCRMCitiesToUsers)
router.route("/find/crm/cities/unknown").post(isAuthenticatedUser, controller.FindUnknownCrmCities);
router.get("/dropdown/cities", isAuthenticatedUser, controller.GetAllCRMCitiesForDropDown)
export default router