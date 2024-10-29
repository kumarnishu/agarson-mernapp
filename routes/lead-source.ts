import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateCRMLeadSource, DeleteCRMLeadSource, GetAllCRMLeadSources, UpdateCRMLeadSource } from "../controllers/lead.controller";
const router = express.Router()

router.route("/crm/sources").get(isAuthenticatedUser, GetAllCRMLeadSources).post(isAuthenticatedUser, CreateCRMLeadSource),
    router.route("/crm/sources/:id").put(isAuthenticatedUser, UpdateCRMLeadSource).delete(isAuthenticatedUser, DeleteCRMLeadSource)


export default router
