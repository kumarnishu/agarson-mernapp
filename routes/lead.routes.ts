import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { CrmController } from "../controllers/CrmController";

let controller = new CrmController()
const router = express.Router()

router.get("/download/template/leads", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateLeads)
router.route("/leads").get(isAuthenticatedUser, controller.GetLeads).post(isAuthenticatedUser, upload.single('visiting_card'), controller.CreateLead)
router.route("/leads/:id").put(isAuthenticatedUser, upload.single('visiting_card'), controller.UpdateLead).delete(isAuthenticatedUser, controller.DeleteLead)

router.route("/update/leads/bulk").put(isAuthenticatedUser, upload.single('excel'), controller.BulkLeadUpdateFromExcel)
router.route("/search/leads").get(isAuthenticatedUser, controller.FuzzySearchLeads)

router.patch("/leads/torefer/:id", isAuthenticatedUser, controller.ConvertLeadToRefer)
router.post("/bulk/leads/delete/useless", isAuthenticatedUser, controller.BulkDeleteUselessLeads)
router.get("/assigned/referrals/:id", isAuthenticatedUser, controller.GetAssignedReferrals)
router.route("/refers/leads/:id").post(isAuthenticatedUser, controller.ReferLead)
router.route("/refers/leads/:id").patch(isAuthenticatedUser, controller.RemoveLeadReferral)
router.route("/merge/leads/:id").put(isAuthenticatedUser, controller.MergeTwoLeads)
router.route("/assigned/refers/report").get(isAuthenticatedUser, controller.GetAssignedRefers)


export default router