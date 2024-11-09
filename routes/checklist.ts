import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetChecklists, CreateChecklist,  EditChecklist, DeleteChecklist, CreateChecklistFromExcel, DownloadExcelTemplateForCreatechecklists, ChangeNextDate, AssignChecklistToUsers, GetMobileChecklists, GetChecklistsReport, BulkDeleteChecklists, GetChecklistTopBarDetails } from "../controllers/checklist";

const router = express.Router()

router.route("/checklists").get(isAuthenticatedUser, GetChecklists).post(isAuthenticatedUser, upload.single('photo'), CreateChecklist)
router.route("/checklists/report").get(isAuthenticatedUser, GetChecklistsReport)
router.route("/checklists/me").get(isAuthenticatedUser, GetMobileChecklists)
router.route("/checklists/:id").put(isAuthenticatedUser, upload.single('photo'), EditChecklist)
router.route("/checklists/:id").delete(isAuthenticatedUser, DeleteChecklist)
router.route("/checklists/nextdate/:id").patch(isAuthenticatedUser, ChangeNextDate)
router.route("/create-from-excel/checklists")
    .put(isAuthenticatedUser, upload.single("excel"), CreateChecklistFromExcel)
router.get("/download/template/checklists", isAuthenticatedUser, DownloadExcelTemplateForCreatechecklists)
router.route("/assign/checklists/").post(isAuthenticatedUser, AssignChecklistToUsers)
router.route("/bulk/delete/checklists").post(isAuthenticatedUser, BulkDeleteChecklists)
router.route("/checklists/topbar-details").get(isAuthenticatedUser, GetChecklistTopBarDetails)

export default router