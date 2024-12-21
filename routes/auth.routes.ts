import express from "express";
import { isAdmin, isAuthenticatedUser } from "../middlewares/auth.middleware";
import { UserController } from "../controllers/UserController";
let controller = new UserController()
const router = express.Router()


router.patch("/make-admin/user/:id", isAuthenticatedUser, isAdmin, controller.MakeAdmin)
router.patch("/allow/multi_login/:id", isAuthenticatedUser, isAdmin, controller.AllowMultiLogin)
router.patch("/block/multi_login/:id", isAuthenticatedUser, isAdmin, controller.BlockMultiLogin)
router.patch("/block/user/:id", isAuthenticatedUser, isAdmin, controller.BlockUser)
router.patch("/unblock/user/:id", isAuthenticatedUser, isAdmin, controller.UnBlockUser)
router.patch("/remove-admin/user/:id", isAuthenticatedUser, isAdmin, controller.RemoveAdmin)
router.post("/login", controller.Login)
router.post("/loginbythisuser", isAuthenticatedUser, controller.LoginByThisUser)
router.post("/login", controller.Login)
router.post("/logout", controller.Logout)
router.route("/password/update").patch(isAuthenticatedUser, controller.updatePassword)
router.route("/password/reset/:id").patch(isAuthenticatedUser, controller.resetUserPassword)
router.patch("/password/reset/:token", controller.ResetPassword)
router.patch("/email/verify/:token", controller.VerifyEmail)
router.route("/permissions").get(isAuthenticatedUser, controller.GetAllPermissions).post(isAuthenticatedUser, controller.AssignPermissionsToUsers)
router.route("/permissions/one").post(isAuthenticatedUser, controller.AssignPermissionsToOneUser)

export default router