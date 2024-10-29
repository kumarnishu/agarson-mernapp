import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { BulkReferUpdateFromExcel, CreateReferParty, DeleteReferParty, FuzzySearchRefers, GetPaginatedRefers, GetRefers, MergeTwoRefers, UpdateReferParty } from "../controllers/lead.controller";
import { upload } from ".";
const router = express.Router()

router.route("/refers").get(isAuthenticatedUser, GetRefers)
router.route("/refers/paginated").get(isAuthenticatedUser, GetPaginatedRefers)
router.route("/search/refers").get(isAuthenticatedUser, FuzzySearchRefers)
router.route("/refers").post(isAuthenticatedUser, upload.none(), CreateReferParty)
router.route("/refers/:id").put(isAuthenticatedUser, upload.none(), UpdateReferParty)
router.route("/refers/:id").delete(isAuthenticatedUser, DeleteReferParty)
router.route("/update/refers/bulk").put(isAuthenticatedUser, upload.single('file'), BulkReferUpdateFromExcel)
router.route("/merge/refers/:id").put(isAuthenticatedUser, MergeTwoRefers)


export default router