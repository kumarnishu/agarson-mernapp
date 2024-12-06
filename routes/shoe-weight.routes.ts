import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { GetMyTodayShoeWeights, GetShoeWeights, CreateShoeWeight, UpdateShoeWeight1, DeleteShoeWeight, UpdateShoeWeight2, UpdateShoeWeight3, ValidateShoeWeight } from "../controllers/shoe-weight.controller";
const router = express.Router()

router.route("/weights/me").get(isAuthenticatedUser, GetMyTodayShoeWeights),
    router.route("/weights").get(isAuthenticatedUser, GetShoeWeights)
        .post(isAuthenticatedUser, upload.single('media'), CreateShoeWeight)
router.route("/weights/:id").put(isAuthenticatedUser, upload.single('media'), UpdateShoeWeight1).delete(isAuthenticatedUser, DeleteShoeWeight),
    router.put("/weights2/:id", isAuthenticatedUser, upload.single('media'), UpdateShoeWeight2),
    router.put("/weights3/:id", isAuthenticatedUser, upload.single('media'), UpdateShoeWeight3),
    router.patch("/weights/validate/:id", isAuthenticatedUser, ValidateShoeWeight)

export default router