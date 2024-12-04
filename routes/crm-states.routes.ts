import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from "./index.routes";
import { GetAllCRMStates, CreateCRMState, UpdateCRMState, DeleteCRMState, BulkCreateAndUpdateCRMStatesFromExcel, AssignCRMStatesToUsers, FindUnknownCrmSates } from "../controllers/crm-states.controller";
const router = express.Router()

router.route("/crm/states").get(isAuthenticatedUser, GetAllCRMStates).post(isAuthenticatedUser, CreateCRMState),
    router.route("/crm/states/:id").put(isAuthenticatedUser, UpdateCRMState).delete(isAuthenticatedUser, DeleteCRMState),
    router.route("/crm/states/excel/createorupdate").put(isAuthenticatedUser, upload.single('file'), BulkCreateAndUpdateCRMStatesFromExcel)
router.patch("/crm/states/assign", isAuthenticatedUser, AssignCRMStatesToUsers)
router.route("/find/crm/states/unknown").post(isAuthenticatedUser, FindUnknownCrmSates);

export default router