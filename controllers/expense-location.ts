import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { DropDownDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { ExpenseLocation } from "../models/expense-location";

export const GetAllExpenseLocation = async (req: Request, res: Response, next: NextFunction) => {
    let data = await ExpenseLocation.find();
    let result: DropDownDto[] = [];
    result = data.map((r) => { return { id: r._id, label: r.name, value: r.name } });
    return res.status(200).json(result)
}

export const CreateExpenseLocation = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as { key: string }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ExpenseLocation.findOne({ name: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this location" })
    let result = await new ExpenseLocation({
        name: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateExpenseLocation = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await ExpenseLocation.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "location not found" })
    console.log(key, oldlocation.name)
    if (key !== oldlocation.name)
        if (await ExpenseLocation.findOne({ name: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this location" })
    oldlocation.name = key
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}
export const DeleteExpenseLocation = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "location id not valid" })
    let name = await ExpenseLocation.findById(id);
    if (!name) {
        return res.status(404).json({ message: "location not found" })
    }
    await name.remove();
    return res.status(200).json({ message: "location deleted successfully" })
}