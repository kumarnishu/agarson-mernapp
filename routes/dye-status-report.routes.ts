import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { ProductionController } from "../controllers/ProductionController";
let controller = new ProductionController()
const router = express.Router()

router.route("/dyestatus/report").get(isAuthenticatedUser,controller. GetDyeStatusReport)

export default router