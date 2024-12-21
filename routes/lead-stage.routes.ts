import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetAllCRMLeadStages, CreateCRMLeadStages, UpdateCRMLeadStages, DeleteCRMLeadStage, FindUnknownCrmStages } from "../controllers/lead-stage.controller";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/crm/stages").get(isAuthenticatedUser, GetAllCRMLeadStages).post(isAuthenticatedUser, CreateCRMLeadStages),
    router.route("/crm/stages/:id").put(isAuthenticatedUser, UpdateCRMLeadStages).delete(isAuthenticatedUser, DeleteCRMLeadStage)
router.route("/find/crm/stages/unknown").post(isAuthenticatedUser, FindUnknownCrmStages);

export default router