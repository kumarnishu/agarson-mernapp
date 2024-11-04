import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetChecklists, CreateChecklist,  EditChecklist, DeleteChecklist, CreateChecklistFromExcel, DownloadExcelTemplateForCreatechecklists, ChangeNextDate } from "../controllers/checklist";

const router = express.Router()

router.route("/checklists").get(isAuthenticatedUser, GetChecklists).post(isAuthenticatedUser, upload.single('photo'), CreateChecklist)
router.route("/checklists/:id").put(isAuthenticatedUser, upload.single('photo'), EditChecklist)
router.route("/checklists/:id").delete(isAuthenticatedUser, DeleteChecklist)
router.route("/checklists/nextdate/:id").patch(isAuthenticatedUser, ChangeNextDate)
router.route("/create-from-excel/checklists")
    .put(isAuthenticatedUser, upload.single("excel"), CreateChecklistFromExcel)
router.get("/download/template/checklists", isAuthenticatedUser, DownloadExcelTemplateForCreatechecklists)

export default router