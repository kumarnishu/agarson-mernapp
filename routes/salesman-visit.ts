import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetSalesManVisitReport } from "../controllers/salesman-visit";
const router = express.Router()

router.route("/salesman-visit").get(isAuthenticatedUser, GetSalesManVisitReport)


export default router