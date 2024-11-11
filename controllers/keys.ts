import { NextFunction, Request, Response } from 'express';
import { DropDownDto, GetKeyDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { trimToLowerText } from '../utils/trimText';
import { Key } from '../models/keys';
import moment from 'moment';

export const GetAllKey = async (req: Request, res: Response, next: NextFunction) => {
    let result = await Key.find().populate('category').populate('created_by').populate('updated_by').sort("key");
    let data: GetKeyDto[];

    data = result.map((r) => {
        return {
            _id:r._id,
            key: r.key,
            category: {id:r.category._id,value:r.category.category,label:r.category.category},
            created_at: moment(r.created_at).format("DD/MM/YYYY"),
            updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
            created_by: {id:r._id,value:r.created_by.username,label:r.created_by.username},
            updated_by: {id:r._id,value:r.updated_by.username,label:r.updated_by.username}
        }
    });
    return res.status(200).json(data)
}

export const CreateKey = async (req: Request, res: Response, next: NextFunction) => {
    let { key, category } = req.body as { key: string, category: string }
    if (!category || !key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    key = trimToLowerText(key);

    if (await Key.findOne({ category: category }))
        return res.status(400).json({ message: "already exists this key" })


    let result = await new Key({
        key,
        category: category,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateKey = async (req: Request, res: Response, next: NextFunction) => {
    let { key, category } = req.body as {
        key: string,
        category: string,
    }
    if (!category || !key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    key = trimToLowerText(key);


    const id = req.params.id
    let oldkey = await Key.findById(id)
    if (!oldkey)
        return res.status(404).json({ message: "key not found" })

    if (oldkey.key !== key)
        if (await Key.findOne({ category: category }))
            return res.status(400).json({ message: "already exists this key" })

    await Key.findByIdAndUpdate(id, {
        key,
        category: category,
        updated_at: new Date(),
        updated_by: req.user
    })

    return res.status(200).json(oldkey)

}
export const DeleteKey = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "key id not valid" })
    let key = await Key.findById(id);
    if (!key) {
        return res.status(404).json({ message: "key not found" })
    }
    await key.remove();
    return res.status(200).json({ message: "key deleted successfully" })
}