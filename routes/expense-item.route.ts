import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";

import { upload } from ".";

import { DropDownController } from "../controllers/DropDownController";
let controller = new DropDownController()
const router = express.Router()

router.route("/expense-items").get(isAuthenticatedUser, controller.GetAllExpenseItems).post(isAuthenticatedUser, controller.CreateExpenseItem)
router.route("/dropdown/expense-items").get(isAuthenticatedUser, controller.GetAllExpenseItemsForDropDown)
router.route("/expense-items/:id").put(isAuthenticatedUser, controller.UpdateExpenseItem)
router.route("/expense-items/:id").delete(isAuthenticatedUser, controller.DeleteExpenseItem)
router.route("/create-from-excel/expense-items")
    .put(isAuthenticatedUser, upload.single("excel"), controller.BulkCreateAndUpdateExpenseItemFromExcel)
router.get("/download/template/expense-items", isAuthenticatedUser, controller.DownloadExcelTemplateForCreateExpenseItem)



export default router
