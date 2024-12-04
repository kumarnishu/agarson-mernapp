import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from "./index.routes";
import { ValidateSpareDye } from "../controllers/shoe-weight.controller";
import { CreateSpareDye, DeleteSpareDye, GetMyTodaySpareDye, GetSpareDyes, UpdateSpareDye } from "../controllers/spare-dye.controller";
const router = express.Router()

router.patch("/sparedyes/validate/:id", isAuthenticatedUser, ValidateSpareDye)
router.route("/sparedyes/me").get(isAuthenticatedUser, GetMyTodaySpareDye),
    router.route("/sparedyes").get(isAuthenticatedUser, GetSpareDyes).post(isAuthenticatedUser, upload.single('media'), CreateSpareDye)
router.route("/sparedyes/:id").put(isAuthenticatedUser, upload.single('media'), UpdateSpareDye).delete(isAuthenticatedUser, DeleteSpareDye)

export default router