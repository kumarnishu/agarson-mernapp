import express from "express";
import { isAdmin, isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { AttendanceController } from "../controllers/AttendanceController";

let controller = new AttendanceController()
const router = express.Router()

router.route("/leaves").get(isAuthenticatedUser, controller.GetAllLeaves)
router.route("/leaves/pending").get(isAuthenticatedUser, controller.GetLeavesPendingForApprovalCount)
router.route("/leaves-balance").get(isAuthenticatedUser, controller.GetAllLeaveBalances).post(isAuthenticatedUser, controller.CreateLeaveBalance)
router.route("/leaves-balance/:id").put(isAuthenticatedUser, controller.UpdateLeaveBalance).delete(isAuthenticatedUser, controller.DeleteLeaveBalance)
router.route("/apply-leave/admin").post(isAuthenticatedUser, controller.ApplyLeaveFromAdmin)
router.route("/apply-leave").post(isAuthenticatedUser, upload.single('file'), controller.ApplyLeave)
router.route("/approve-reject-leave/:id").post(isAuthenticatedUser, isAdmin, controller.ApproveOrRejectLeave)
router.route("/attendance-report").get(isAuthenticatedUser, controller.GetAllAttendanceReport)

export default router