import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetShoeWeightDifferenceReports } from "../controllers/production.controller";
const router = express.Router()

router.route("/shoeweight/diffreports").get(isAuthenticatedUser, GetShoeWeightDifferenceReports)

export default router