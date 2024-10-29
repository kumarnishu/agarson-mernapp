import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { BulkDeleteUselessLeads, BulkLeadUpdateFromExcel, ConvertLeadToRefer, CreateLead, DeleteLead, FuzzySearchLeads, GetAssignedReferrals, GetLeads, MergeTwoLeads, ReferLead, RemoveLeadReferral, UpdateLead } from "../controllers/lead.controller";
import { upload } from ".";
const router = express.Router()

router.route("/leads").get(isAuthenticatedUser, GetLeads).post(isAuthenticatedUser, upload.single('visiting_card'), CreateLead)
router.route("/leads/:id").put(isAuthenticatedUser, upload.single('visiting_card'), UpdateLead).delete(isAuthenticatedUser, DeleteLead)

router.route("/update/leads/bulk").put(isAuthenticatedUser, upload.single('file'), BulkLeadUpdateFromExcel)
router.route("/search/leads").get(isAuthenticatedUser, FuzzySearchLeads)

router.patch("/leads/torefer/:id", isAuthenticatedUser, ConvertLeadToRefer)
router.post("/bulk/leads/delete/useless", isAuthenticatedUser, BulkDeleteUselessLeads)
router.get("/assigned/referrals/:id", isAuthenticatedUser, GetAssignedReferrals)
router.route("/refers/leads/:id").post(isAuthenticatedUser, ReferLead)
router.route("/refers/leads/:id").patch(isAuthenticatedUser, RemoveLeadReferral)
router.route("/merge/leads/:id").put(isAuthenticatedUser, MergeTwoLeads)

export default router