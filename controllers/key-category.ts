import { NextFunction, Request, Response } from 'express';
import { DropDownDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { KeyCategory } from "../models/key-category";
import { trimToLowerText } from '../utils/trimText';

export const GetAllKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    let result = await KeyCategory.find();
    let data: DropDownDto[];
    data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(data)
}

export const CreateKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    let { key } = req.body as { key: string }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }

    if (await KeyCategory.findOne({ category: key }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new KeyCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    let { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }


    const id = req.params.id
    let oldcategory = await KeyCategory.findById(id)
    if (!oldcategory)
        return res.status(404).json({ message: "category not found" })

    if (oldcategory.category !== key)
        if (await KeyCategory.findOne({ category: key }))
            return res.status(400).json({ message: "already exists this category" })
    oldcategory.category = key
    oldcategory.updated_at = new Date()
    if (req.user)
        oldcategory.updated_by = req.user
    await oldcategory.save()
    return res.status(200).json(oldcategory)

}
export const DeleteKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await KeyCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
}