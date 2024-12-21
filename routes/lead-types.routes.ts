import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/crm/leadtypes").get(isAuthenticatedUser, controller.GetAllCRMLeadTypes).post(isAuthenticatedUser, controller.CreateCRMLeadTypes),
    router.route("/crm/leadtypes/:id").put(isAuthenticatedUser, controller.UpdateCRMLeadTypes).delete(isAuthenticatedUser, controller.DeleteCRMLeadType)


export default router