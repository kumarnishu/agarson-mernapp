import { NextFunction, Request, Response } from 'express';
import { MachineCategory } from "../models/machine-category";
import { Machine } from '../models/machine';
import isMongoId from 'validator/lib/isMongoId';

export const GetMachineCategories = async (req: Request, res: Response, next: NextFunction) => {
    let result = (await MachineCategory.find()).map((c) => {
        return { id: c._id, label: c.category, value: c.category }
    })
    return res.status(200).json(result)
}
export const CreateMachineCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {key:string}
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await MachineCategory.findOne({ category: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new MachineCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json({ message: "success" })

}

export const UpdateMachineCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {key:string}
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldtype = await MachineCategory.findById(id)
    if (!oldtype)
        return res.status(404).json({ message: "category not found" })
    if (key !== oldtype.category)
        if (await MachineCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    let prevtype = oldtype.category
    oldtype.category = key
    oldtype.updated_at = new Date()
    if (req.user)
        oldtype.updated_by = req.user
    await Machine.updateMany({ category: prevtype }, { category: key })
    await oldtype.save()
    return res.status(200).json({ message: "updated" })

}
export const DeleteMachineCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await MachineCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
}