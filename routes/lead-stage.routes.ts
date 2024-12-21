import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/crm/stages").get(isAuthenticatedUser, controller.GetAllCRMLeadStages).post(isAuthenticatedUser, controller.CreateCRMLeadStages),
    router.route("/crm/stages/:id").put(isAuthenticatedUser, controller.UpdateCRMLeadStages).delete(isAuthenticatedUser, controller.DeleteCRMLeadStage)
router.route("/find/crm/stages/unknown").post(isAuthenticatedUser, controller.FindUnknownCrmStages);

export default router