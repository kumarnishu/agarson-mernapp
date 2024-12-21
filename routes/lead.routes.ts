import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/leads").get(isAuthenticatedUser, controller.GetLeads).post(isAuthenticatedUser, upload.single('visiting_card'), controller.CreateLead)
router.route("/leads/:id").put(isAuthenticatedUser, upload.single('visiting_card'), controller.UpdateLead).delete(isAuthenticatedUser, controller.DeleteLead)

router.route("/update/leads/bulk").put(isAuthenticatedUser, upload.single('file'), controller.BulkLeadUpdateFromExcel)
router.route("/search/leads").get(isAuthenticatedUser, controller.FuzzySearchLeads)

router.patch("/leads/torefer/:id", isAuthenticatedUser, controller.ConvertLeadToRefer)
router.post("/bulk/leads/delete/useless", isAuthenticatedUser, controller.BulkDeleteUselessLeads)
router.get("/assigned/referrals/:id", isAuthenticatedUser, controller.GetAssignedReferrals)
router.route("/refers/leads/:id").post(isAuthenticatedUser, controller.ReferLead)
router.route("/refers/leads/:id").patch(isAuthenticatedUser, controller.RemoveLeadReferral)
router.route("/merge/leads/:id").put(isAuthenticatedUser, controller.MergeTwoLeads)

export default router