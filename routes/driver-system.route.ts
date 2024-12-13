import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
const router = express.Router()
import { CreateDriverSystem, DeleteDriverSystem, GetAllDriverSystems, GetMyDriverSystems, UpdateDriverSystem, UploadDriverSystemPhoto } from "../controllers/driver-system.controller";


router.route("/driver-system/me").get(isAuthenticatedUser, GetMyDriverSystems)
router.route("/driver-system").get(isAuthenticatedUser, GetAllDriverSystems)
    .post(isAuthenticatedUser, upload.single('media'), CreateDriverSystem)
router.route("/driver-system/:id").put(isAuthenticatedUser, UpdateDriverSystem).delete(isAuthenticatedUser, DeleteDriverSystem)
router.put("/driver-system/upload/:id", isAuthenticatedUser, upload.single('media'), UploadDriverSystemPhoto)


export default router