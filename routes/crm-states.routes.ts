import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { AuthorizationController } from "../controllers/AuthorizationController";
let controller = new AuthorizationController()
const router = express.Router()

router.route("/crm/states").get(isAuthenticatedUser, controller.GetAllCRMStates).post(isAuthenticatedUser, controller.CreateCRMState),
    router.route("/crm/states/:id").put(isAuthenticatedUser, controller.UpdateCRMState).delete(isAuthenticatedUser, controller.DeleteCRMState),
    router.route("/crm/states/excel/createorupdate").put(isAuthenticatedUser, upload.single('file'), controller.BulkCreateAndUpdateCRMStatesFromExcel)
router.patch("/crm/states/assign", isAuthenticatedUser, controller.AssignCRMStatesToUsers)
router.route("/find/crm/states/unknown").post(isAuthenticatedUser, controller.FindUnknownCrmSates);

export default router