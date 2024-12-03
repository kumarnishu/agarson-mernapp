import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { DropDownDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { ExpenseCategory } from "../models/expense-category";

export const GetAllExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
    let data = await ExpenseCategory.find();
    let result: DropDownDto[] = [];
    result = data.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(result)
}

export const CreateExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as { key: string }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ExpenseCategory.findOne({ category: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new ExpenseCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await ExpenseCategory.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "category not found" })
    console.log(key, oldlocation.category)
    if (key !== oldlocation.category)
        if (await ExpenseCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    oldlocation.category = key
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}
export const DeleteExpenseCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await ExpenseCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
}