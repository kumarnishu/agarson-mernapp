import express from "express";
import { upload } from ".";
import { test } from "../controllers/test";
import { GetVisitReports, SaveSalesManVisitReport } from "../controllers/visit-report";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
const router = express.Router()

router.post("/test", upload.single("excel"), isAuthenticatedUser, SaveSalesManVisitReport)
router.get("/test", isAuthenticatedUser, GetVisitReports)


export default router