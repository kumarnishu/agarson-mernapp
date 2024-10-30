import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { GetMyTodayProductions, GetProductions, CreateProduction, UpdateProduction, DeleteProduction } from "../controllers/production";
const router = express.Router()

router.route("/productions/me").get(isAuthenticatedUser, GetMyTodayProductions)
router.route("/productions").get(isAuthenticatedUser, GetProductions)
    .post(isAuthenticatedUser, CreateProduction)
router.route("/productions/:id").put(isAuthenticatedUser, UpdateProduction)
    .delete(isAuthenticatedUser, DeleteProduction)


export default router