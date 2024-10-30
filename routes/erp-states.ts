import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetAllStates, CreateState, UpdateState, DeleteErpState, BulkCreateAndUpdateErpStatesFromExcel, AssignErpStatesToUsers } from "../controllers/erp-states";


const router = express.Router()

router.route("/states").get(isAuthenticatedUser, GetAllStates)
router.route("/states").post(isAuthenticatedUser, CreateState)
router.route("/states/:id").put(isAuthenticatedUser, UpdateState)
    .delete(isAuthenticatedUser, DeleteErpState)
router.route("/states").put(isAuthenticatedUser, upload.single('file'), BulkCreateAndUpdateErpStatesFromExcel)
router.route("/bulk/assign/states").patch(isAuthenticatedUser, AssignErpStatesToUsers)
export default router