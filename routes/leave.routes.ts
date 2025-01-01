import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { AttendanceController } from "../controllers/AttendanceController";

let controller = new AttendanceController()
const router = express.Router()

router.route("/leaves").get(isAuthenticatedUser, controller.GetAllLeaves).post(isAuthenticatedUser, upload.single('document'), controller.ApplyLeave)
router.route("/leaves-balance").get(isAuthenticatedUser, controller.GetAllLeaveBalances).post(isAuthenticatedUser, controller.CreateLeaveBalance)
router.route("/leaves-balance/:id").put(isAuthenticatedUser, controller.UpdateLeaveBalance).delete(isAuthenticatedUser, controller.DeleteLeaveBalance)



export default router