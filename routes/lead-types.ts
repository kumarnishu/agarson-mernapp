import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetAllCRMLeadTypes, CreateCRMLeadTypes, UpdateCRMLeadTypes, DeleteCRMLeadType } from "../controllers/lead-types";
const router = express.Router()

router.route("/crm/leadtypes").get(isAuthenticatedUser, GetAllCRMLeadTypes).post(isAuthenticatedUser, CreateCRMLeadTypes),
    router.route("/crm/leadtypes/:id").put(isAuthenticatedUser, UpdateCRMLeadTypes).delete(isAuthenticatedUser, DeleteCRMLeadType)


export default router