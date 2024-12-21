import express from "express";
import { isAuthenticatedUser } from "../middlewares/auth.middleware";
import { BulkCreateAndUpdateExpenseItemFromExcel, CreateExpenseItem, DeleteExpenseItem, DownloadExcelTemplateForCreateExpenseItem, GetAllExpenseItems, GetAllExpenseItemsForDropDown, UpdateExpenseItem } from "../controllers/expense-item.controller";

import { upload } from ".";

import { FeatureController } from "../controllers/FeaturesController";
let controller = new FeatureController()
const router = express.Router()

router.route("/expense-items").get(isAuthenticatedUser, GetAllExpenseItems).post(isAuthenticatedUser, CreateExpenseItem)
router.route("/dropdown/expense-items").get(isAuthenticatedUser, GetAllExpenseItemsForDropDown)
router.route("/expense-items/:id").put(isAuthenticatedUser, UpdateExpenseItem)
router.route("/expense-items/:id").delete(isAuthenticatedUser, DeleteExpenseItem)
router.route("/create-from-excel/expense-items")
    .put(isAuthenticatedUser, upload.single("excel"), BulkCreateAndUpdateExpenseItemFromExcel)
router.get("/download/template/expense-items", isAuthenticatedUser, DownloadExcelTemplateForCreateExpenseItem)



export default router
