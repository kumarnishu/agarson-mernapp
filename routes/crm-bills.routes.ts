import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/bills").post(isAuthenticatedUser, upload.single('billphoto'), controller.CreateBill)
router.route("/bills/:id").put(isAuthenticatedUser, upload.single('billphoto'), controller.UpdateBill).delete(isAuthenticatedUser, controller.DeleteBill)
router.route("/bills/history/leads/:id").get(isAuthenticatedUser, controller.GetLeadPartyBillsHistory)
router.route("/bills/history/refers/:id").get(isAuthenticatedUser, controller.GetReferPartyBillsHistory)

export default router