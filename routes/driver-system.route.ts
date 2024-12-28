import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { DriverAppController } from "../controllers/DriverAppController";
let controller = new DriverAppController()
const router = express.Router()

router.route("/driver-system/me").get(isAuthenticatedUser, controller.GetMyDriverSystems)
router.route("/driver-system").get(isAuthenticatedUser, controller.GetAllDriverSystems)
    .post(isAuthenticatedUser, upload.single('media'), controller.CreateDriverSystem)
router.route("/driver-system/:id").put(isAuthenticatedUser, controller.UpdateDriverSystem).delete(isAuthenticatedUser, controller.DeleteDriverSystem)
router.put("/driver-system/upload/:id", isAuthenticatedUser, upload.single('media'), controller.UploadDriverSystemPhoto)


export default router