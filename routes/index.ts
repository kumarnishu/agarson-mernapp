import multer from "multer";
import express from "express";
const router = express.Router()
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 50 } })

import ArticlesRoutes from "./articles";
import AuthRoutes from "./auth";
import ChecklistCategoryRoutes from "./checklist-category";
import ChecklistRoutes from "./checklist";
import CrmBillsRoutes from "./crm-bills";
import CrmCityRoutes from "./crm-city";
import CrmRemarksRoutes from "./crm-remarks";
import CrmStatesRoutes from "./crm-states";
import CrmReportsRoutes from "./crm.reports";
import DyeLocationRoutes from "./dye-location";
import DyeStatusReportRoutes from "./dye-status-report";
import DyeRoutes from "./dye";
import EmailRoutes from "./email";
import ErpEmployeeRoutes from "./erp-employee";
import ErpStatesRoutes from "./erp-states";
import ErpReportsRoutes from "./erp.reports";
import LeadSourceRoutes from "./lead-source";
import LeadStageRoutes from "./lead-stage";
import LeadTypesRoutes from "./lead-types";
import LeadRoutes from "./lead";
import MachineCategoriesRoutes from "./machine-categories";
import MachineRoutes from "./machine";
import ProductionReportRoutes from "./production-report";
import ProductionRoutes from "./production";
import ReferRoutes from "./refer";
import ShoeWeightReportRoutes from "./shoe-weight-report";
import ShoeWeightRoutes from "./shoe-weight";
import SoleThicknessRoutes from "./sole-thickness";
import SpareDyeRoute from "./spare-dye";
import UserRoutes from "./user";


router.use(ArticlesRoutes);
router.use(AuthRoutes);
router.use(ChecklistCategoryRoutes);
router.use(ChecklistRoutes);
router.use(CrmBillsRoutes);
router.use(CrmCityRoutes);
router.use(CrmRemarksRoutes);
router.use(CrmStatesRoutes);
router.use(CrmReportsRoutes);
router.use(DyeLocationRoutes);
router.use(DyeStatusReportRoutes);
router.use(DyeRoutes);
router.use(EmailRoutes);
router.use(ErpEmployeeRoutes);
router.use(ErpStatesRoutes);
router.use(ErpReportsRoutes);
router.use(LeadSourceRoutes);
router.use(LeadStageRoutes);
router.use(LeadTypesRoutes);
router.use(LeadRoutes);
router.use(MachineCategoriesRoutes);
router.use(MachineRoutes);
router.use(ProductionReportRoutes);
router.use(ProductionRoutes);
router.use(ReferRoutes);
router.use(ShoeWeightReportRoutes);
router.use(ShoeWeightRoutes);
router.use(SoleThicknessRoutes);
router.use(SpareDyeRoute);
router.use(UserRoutes);

export default router;

