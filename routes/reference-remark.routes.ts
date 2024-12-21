import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { SalesController } from "../controllers/SalesController";
let controller = new SalesController()
const router = express.Router()

router.route("/references/remarks").post(isAuthenticatedUser, controller.NewReferenceRemark)
router.route("/references/remarks/:id")
    .put(isAuthenticatedUser, controller.UpdateReferenceRemark)
    .delete(isAuthenticatedUser, controller.DeleteReferenceRemark)
router.route("/references/remarks").get(isAuthenticatedUser, controller.GetReferenceRemarkHistory)

export default router