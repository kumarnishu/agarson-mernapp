import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { upload } from ".";
import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/refers").get(isAuthenticatedUser, controller.GetRefers)
router.route("/refers/paginated").get(isAuthenticatedUser, controller.GetPaginatedRefers)
router.route("/search/refers").get(isAuthenticatedUser, controller.FuzzySearchRefers)
router.route("/refers").post(isAuthenticatedUser, upload.none(), controller.CreateReferParty)
router.route("/refers/:id").put(isAuthenticatedUser, upload.none(), controller.UpdateReferParty)
router.route("/refers/:id").delete(isAuthenticatedUser, controller.DeleteReferParty)
router.route("/update/refers/bulk").put(isAuthenticatedUser, upload.single('file'), controller.BulkReferUpdateFromExcel)
router.route("/merge/refers/:id").put(isAuthenticatedUser, controller.MergeTwoRefers)
router.route("/toogle-convert/refers/:id").patch(isAuthenticatedUser, controller.ToogleReferPartyConversion)


export default router