import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateBill, DeleteBill, GetLeadPartyBillsHistory, GetReferPartyBillsHistory, UpdateBill } from "../controllers/lead.controller";
import { upload } from ".";
const router = express.Router()

router.route("/bills").post(isAuthenticatedUser, upload.single('billphoto'), CreateBill)
router.route("/bills/:id").put(isAuthenticatedUser, upload.single('billphoto'), UpdateBill).delete(isAuthenticatedUser, DeleteBill)
router.route("/bills/history/leads/:id").get(isAuthenticatedUser, GetLeadPartyBillsHistory)
router.route("/bills/history/refers/:id").get(isAuthenticatedUser, GetReferPartyBillsHistory)

export default router