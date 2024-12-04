import express from "express";
import { GetSoleThickness, CreateSoleThickness, GetMyTodaySoleThickness, DeleteSoleThickness, UpdateSoleThickness } from "../controllers/sole-thickness.controller";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
const router = express.Router()

router.route("/solethickness").get(isAuthenticatedUser, GetSoleThickness).post(isAuthenticatedUser, CreateSoleThickness)
router.route("/solethickness/me").get(isAuthenticatedUser, GetMyTodaySoleThickness)
router.route("/solethickness/:id").get(isAuthenticatedUser, DeleteSoleThickness).put(isAuthenticatedUser, UpdateSoleThickness).delete(isAuthenticatedUser, DeleteSoleThickness)

export default router
