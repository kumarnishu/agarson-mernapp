import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { CreateChecklist, CreateChecklistFromExcel, DeleteChecklist, DownloadExcelTemplateForCreatechecklists, EditChecklist, GetChecklists, ToogleChecklist } from "../controllers/checklist.controller";
import { upload } from ".";

const router = express.Router()

router.route("/checklists").get(isAuthenticatedUser, GetChecklists).post(isAuthenticatedUser, upload.single('photo'), CreateChecklist)
router.route("/checklists/toogle/:id").patch(isAuthenticatedUser, ToogleChecklist)
router.route("/checklists/:id").put(isAuthenticatedUser, upload.single('photo'), EditChecklist)
router.route("/checklists/:id").delete(isAuthenticatedUser, DeleteChecklist)
router.route("/create-from-excel/checklists")
    .post(isAuthenticatedUser, upload.single("excel"), CreateChecklistFromExcel)
router.get("/download/template/checklists", isAuthenticatedUser, DownloadExcelTemplateForCreatechecklists)

export default router