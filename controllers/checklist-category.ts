import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { ChecklistCategory } from "../models/checklist-category";
import {  DropDownDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";

export const GetAllChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    let data = await ChecklistCategory.find();
    let result: DropDownDto[]=[];
    result = data.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(result)
}

export const CreateChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as { key: string }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ChecklistCategory.findOne({ category: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new ChecklistCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await ChecklistCategory.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "category not found" })
    console.log(key, oldlocation.category)
    if (key !== oldlocation.category)
        if (await ChecklistCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    oldlocation.category = key
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}
export const DeleteChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await ChecklistCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
}