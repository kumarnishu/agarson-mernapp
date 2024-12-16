import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { DeleteReferenceRemark, GetReferenceRemarkHistory, NewReferenceRemark, UpdateReferenceRemark } from "../controllers/reference-remark.controller";
const router = express.Router()

router.route("/references/remarks").post(isAuthenticatedUser, NewReferenceRemark)
router.route("/references/remarks/:id")
    .put(isAuthenticatedUser, UpdateReferenceRemark)
    .delete(isAuthenticatedUser, DeleteReferenceRemark)
router.route("/references/remarks").get(isAuthenticatedUser, GetReferenceRemarkHistory)

export default router