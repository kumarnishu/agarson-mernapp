import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetRemarkHistory, GetReferRemarkHistory, GetActivities, NewRemark, UpdateRemark, DeleteRemark } from "../controllers/crm-remarks";
const router = express.Router()

router.route("/remarks/:id").get(isAuthenticatedUser, GetRemarkHistory)
router.route("/remarks/refers/:id").get(isAuthenticatedUser, GetReferRemarkHistory)
router.route("/activities").get(isAuthenticatedUser, GetActivities)
router.route("/remarks/:id").post(isAuthenticatedUser, NewRemark)
router.route("/remarks/:id").put(isAuthenticatedUser, UpdateRemark)
router.route("/remarks/:id").delete(isAuthenticatedUser, DeleteRemark)


export default router