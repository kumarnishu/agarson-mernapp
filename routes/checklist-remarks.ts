import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DeleteChecklistRemark, GetChecklistBoxRemarkHistory, GetChecklistRemarkHistory, NewChecklistRemark, UpdateChecklistRemark } from "../controllers/checklist-remark";
const router = express.Router()

router.route("/checklist/remarks").post(isAuthenticatedUser, NewChecklistRemark)
router.route("/checklist/remarks/box/:id").get(isAuthenticatedUser, GetChecklistBoxRemarkHistory)
router.route("/checklist/remarks/:id").get(isAuthenticatedUser, GetChecklistRemarkHistory)
router.route("/checklist/remarks/:id").put(isAuthenticatedUser, UpdateChecklistRemark)
router.route("/checklist/remarks/:id").delete(isAuthenticatedUser, DeleteChecklistRemark)


export default router