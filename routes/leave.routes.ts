import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { AttendanceController } from "../controllers/AttendanceController";

let controller = new AttendanceController()
const router = express.Router()

router.route("/leaves-approved").get(isAuthenticatedUser, controller.GetAllLeaveApproved).post(isAuthenticatedUser, upload.single('document'), controller.ApplyLeave)
router.route("/leaves-balance").get(isAuthenticatedUser, controller.GetAllLeaveBalances).post(isAuthenticatedUser, controller.CreateLeaveBalance)
router.route("/leaves-balance/:id").get(isAuthenticatedUser, controller.UpdateLeaveBalance).post(isAuthenticatedUser, controller.DeleteLeaveBalance)
router.route("/leaves-requests").get(isAuthenticatedUser, controller.GetAllLeavePending)



export default router