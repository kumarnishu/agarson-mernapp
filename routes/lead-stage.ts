import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateCRMLeadStages, DeleteCRMLeadStage, FindUnknownCrmStages, GetAllCRMLeadStages, UpdateCRMLeadStages } from "../controllers/lead.controller";
const router = express.Router()

router.route("/crm/stages").get(isAuthenticatedUser, GetAllCRMLeadStages).post(isAuthenticatedUser, CreateCRMLeadStages),
    router.route("/crm/stages/:id").put(isAuthenticatedUser, UpdateCRMLeadStages).delete(isAuthenticatedUser, DeleteCRMLeadStage)
router.route("/find/crm/stages/unknown").post(isAuthenticatedUser, FindUnknownCrmStages);

export default router