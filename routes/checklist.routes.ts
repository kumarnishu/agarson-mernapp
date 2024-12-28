import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { ChecklistController } from "../controllers/ChecklistController";
let controller = new ChecklistController()
const router = express.Router()

router.route("/checklists").get(isAuthenticatedUser, controller.GetChecklists).post(isAuthenticatedUser, upload.single('photo'), controller.CreateChecklist)
router.route("/checklists/report").get(isAuthenticatedUser, controller.GetChecklistsReport)

router.route("/checklists/me").get(isAuthenticatedUser, controller.GetMobileChecklists)
router.route("/checklists/:id").put(isAuthenticatedUser, upload.single('photo'), controller.EditChecklist)
router.route("/checklists/:id").delete(isAuthenticatedUser, controller.DeleteChecklist)
router.route("/checklists/nextdate/:id").patch(isAuthenticatedUser, controller.ChangeNextDate)
router.route("/create-from-excel/checklists")
    .put(isAuthenticatedUser, upload.single("excel"), controller.CreateChecklistFromExcel)
router.get("/download/template/checklists", isAuthenticatedUser, controller.DownloadExcelTemplateForCreatechecklists)
router.route("/assign/checklists/").post(isAuthenticatedUser, controller.AssignChecklistToUsers)
router.route("/bulk/delete/checklists").post(isAuthenticatedUser, controller.BulkDeleteChecklists)
router.route("/checklists/topbar-details").get(isAuthenticatedUser, controller.GetChecklistTopBarDetails)

export default router