import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/crm/sources").get(isAuthenticatedUser, controller.GetAllCRMLeadSources).post(isAuthenticatedUser, controller.CreateCRMLeadSource),
    router.route("/crm/sources/:id").put(isAuthenticatedUser, controller.UpdateCRMLeadSource).delete(isAuthenticatedUser, controller.DeleteCRMLeadSource)


export default router
