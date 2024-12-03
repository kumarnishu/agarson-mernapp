import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { DropDownDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { ItemUnit } from "../models/item-unit";

export const GetAllItemUnit = async (req: Request, res: Response, next: NextFunction) => {
    let data = await ItemUnit.find();
    let result: DropDownDto[] = [];
    result = data.map((r) => { return { id: r._id, label: r.unit, value: r.unit } });
    return res.status(200).json(result)
}

export const CreateItemUnit = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as { key: string }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ItemUnit.findOne({ unit: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this unit" })
    let result = await new ItemUnit({
        unit: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateItemUnit = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await ItemUnit.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "unit not found" })
    console.log(key, oldlocation.unit)
    if (key !== oldlocation.unit)
        if (await ItemUnit.findOne({ unit: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this unit" })
    oldlocation.unit = key
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}
export const DeleteItemUnit = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "unit id not valid" })
    let unit = await ItemUnit.findById(id);
    if (!unit) {
        return res.status(404).json({ message: "unit not found" })
    }
    await unit.remove();
    return res.status(200).json({ message: "unit deleted successfully" })
}