import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/dyes").get(isAuthenticatedUser, controller.GetDyes)
    .post(isAuthenticatedUser, controller.CreateDye)
router.route("/dropdown/dyes").get(isAuthenticatedUser, controller.GetDyeForDropdown)
router.put("/dyes/:id", isAuthenticatedUser, controller.UpdateDye)
router.get("/dyes/:id", isAuthenticatedUser, controller.GetDyeById)
router.patch("/dyes/toogle/:id", isAuthenticatedUser, controller.ToogleDye)
router.put("/dyes/upload/bulk", isAuthenticatedUser, upload.single('file'), controller.BulkUploadDye)

export default router