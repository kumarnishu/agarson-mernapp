import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from "./user.routes";
import { AddMaintenanceItemRemark, CreateMaintenance, CreateMaintenanceCategory, CreateMaintenanceFromExcel, DeleteMaintenance,  DownloadExcelTemplateForMaintenance, GetAllMaintenance, GetAllMaintenanceCategory, GetAllMaintenanceReport, ToogleMaintenanceCategory, ToogleMaintenanceItem, UpdateMaintenance, UpdateMaintenanceCategory, ViewMaintenanceItemRemarkHistory, ViewMaintenanceItemRemarkHistoryByDates } from "../controllers/maintenance.controller";

const router = express.Router()


router.route("/maintenances/categories").get(isAuthenticatedUser, GetAllMaintenanceCategory).post(isAuthenticatedUser, CreateMaintenanceCategory)
router.route("/maintenances/categories/:id").put(isAuthenticatedUser, UpdateMaintenanceCategory).patch(isAuthenticatedUser,ToogleMaintenanceCategory)
router.route("/maintenances").get(isAuthenticatedUser, GetAllMaintenance).post(isAuthenticatedUser, upload.single("none"), CreateMaintenance)
router.route("/maintenances/:id").put(isAuthenticatedUser, UpdateMaintenance).delete(isAuthenticatedUser, DeleteMaintenance)
router.route("/maintenances/item/toogle/:id").patch(isAuthenticatedUser, ToogleMaintenanceItem)
router.route("/maintenances/item/remarks/:id").get(isAuthenticatedUser, ViewMaintenanceItemRemarkHistory).post(AddMaintenanceItemRemark)
router.route("/maintenances/item/remarks/dates/:id").get(isAuthenticatedUser, ViewMaintenanceItemRemarkHistoryByDates)
router.route("/maintenances/report").get(isAuthenticatedUser, GetAllMaintenanceReport)
router.route("/create-from-excel/maintenances")
    .post(isAuthenticatedUser, upload.single("excel"), CreateMaintenanceFromExcel)
router.get("/download/template/maintenances", isAuthenticatedUser, DownloadExcelTemplateForMaintenance)

export default router