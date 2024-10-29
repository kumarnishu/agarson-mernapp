import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateCRMLeadTypes, DeleteCRMLeadType, GetAllCRMLeadTypes, UpdateCRMLeadTypes } from "../controllers/lead.controller";
const router = express.Router()

router.route("/crm/leadtypes").get(isAuthenticatedUser, GetAllCRMLeadTypes).post(isAuthenticatedUser, CreateCRMLeadTypes),
    router.route("/crm/leadtypes/:id").put(isAuthenticatedUser, UpdateCRMLeadTypes).delete(isAuthenticatedUser, DeleteCRMLeadType)


export default router