import express from "express";
import { isAdmin, isAuthenticatedUser } from "../middlewares/auth.middleware";
import { MakeAdmin, AllowMultiLogin, BlockMultiLogin, BlockUser, UnBlockUser, RemoveAdmin, Login, Logout, updatePassword, resetUserPassword, ResetPassword, VerifyEmail, GetAllPermissions, AssignPermissionsToUsers, AssignPermissionsToOneUser, LoginByThisUser } from "../controllers/auth.controller";
const router = express.Router()


router.patch("/make-admin/user/:id", isAuthenticatedUser, isAdmin, MakeAdmin)
router.patch("/allow/multi_login/:id", isAuthenticatedUser, isAdmin, AllowMultiLogin)
router.patch("/block/multi_login/:id", isAuthenticatedUser, isAdmin, BlockMultiLogin)
router.patch("/block/user/:id", isAuthenticatedUser, isAdmin, BlockUser)
router.patch("/unblock/user/:id", isAuthenticatedUser, isAdmin, UnBlockUser)
router.patch("/remove-admin/user/:id", isAuthenticatedUser, isAdmin, RemoveAdmin)
router.post("/login", Login)
router.post("/loginbythisuser", isAuthenticatedUser, LoginByThisUser)
router.post("/login", Login)
router.post("/logout", Logout)
router.route("/password/update").patch(isAuthenticatedUser, updatePassword)
router.route("/password/reset/:id").patch(isAuthenticatedUser, resetUserPassword)
router.patch("/password/reset/:token", ResetPassword)
router.patch("/email/verify/:token", VerifyEmail)
router.route("/permissions").get(isAuthenticatedUser, GetAllPermissions).post(isAuthenticatedUser, AssignPermissionsToUsers)
router.route("/permissions/one").post(isAuthenticatedUser, AssignPermissionsToOneUser)

export default router