import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { AssignErpEmployeesToUsers, CreateErpEmployee, DeleteErpEmployee, GetAllErpEmployees, UpdateErpEmployee } from "../controllers/erp.controller";

const router = express.Router()

router.route("/employees").get(isAuthenticatedUser, GetAllErpEmployees)
router.route("/employees").post(isAuthenticatedUser, CreateErpEmployee)
router.route("/employees/:id").put(isAuthenticatedUser, UpdateErpEmployee)
    .delete(isAuthenticatedUser, DeleteErpEmployee)
router.route("/bulk/assign/employees").patch(isAuthenticatedUser, AssignErpEmployeesToUsers)
export default router