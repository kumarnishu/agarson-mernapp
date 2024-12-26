import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/checklist/remarks").post(isAuthenticatedUser, controller.NewChecklistRemark)
router.route("/checklist/remarks-admin").post(isAuthenticatedUser, controller.NewChecklistRemarkFromAdmin)
router.route("/checklist/remarks/box/:id").get(isAuthenticatedUser, controller.GetChecklistBoxRemarkHistory)
router.route("/checklist/remarks/:id").get(isAuthenticatedUser, controller.GetChecklistRemarkHistory)
router.route("/checklist/remarks/:id").put(isAuthenticatedUser, controller.UpdateChecklistRemark)
router.route("/checklist/remarks/:id").delete(isAuthenticatedUser, controller.DeleteChecklistRemark)


export default router