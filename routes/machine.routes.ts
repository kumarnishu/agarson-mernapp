import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/machines").get(isAuthenticatedUser, controller.GetMachines)
    .post(isAuthenticatedUser, controller.CreateMachine)
router.route("/dropdown/machines").get(isAuthenticatedUser, controller.GetMachinesForDropDown)
router.put("/machines/:id", isAuthenticatedUser, controller.UpdateMachine)
router.patch("/machines/toogle/:id", isAuthenticatedUser, controller.ToogleMachine)
router.put("/machines/upload/bulk", isAuthenticatedUser, upload.single('file'), controller.BulkUploadMachine)

export default router