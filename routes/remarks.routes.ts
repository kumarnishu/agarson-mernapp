import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { RemarkController } from "../controllers/RemarkController";
let controller = new RemarkController()
const router = express.Router()

router.route("/sample-system/remarks").post(isAuthenticatedUser, controller.NewSampleSystemRemark)
router.route("/sample-system/remarks/:id").get(isAuthenticatedUser, controller.GetSampleSystemRemarkHistory).put(isAuthenticatedUser, controller.UpdateSampleSystemRemark).delete(isAuthenticatedUser, controller.DeleteSampleSystemRemark)


export default router