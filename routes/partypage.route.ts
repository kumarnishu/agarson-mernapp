import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { PartyPageController } from "../controllers/PartyPageController";


let controller = new PartyPageController()
const router = express.Router()

router.route("/partypage/ageing2").get(isAuthenticatedUser, controller.GetPartyAgeingReport2)
router.route("/partypage/remarks").get(isAuthenticatedUser, controller.GetPartyLast5Remarks)
router.route("/partypage/stock").get(isAuthenticatedUser, controller.GetCurrentStock)
router.route("/partypage/sale").get(isAuthenticatedUser, controller.GetPartyArticleSaleMonthly)
router.route("/partypage/forcast-growth").get(isAuthenticatedUser, controller.GetPartyForcastAndGrowth)
router.route("/partypage/orders").get(isAuthenticatedUser, controller.GetPartyPendingOrders)
router.route("/partypage/ageing1").get(isAuthenticatedUser, controller.GetPartyAgeing1)

export default router