import { NextFunction, Request, Response } from 'express';
import { DropDownDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { IKeyCategory, KeyCategory } from "../models/key-category";
import { User } from '../models/user';
import { Key } from '../models/keys';

export const GetAllKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    let assigned_keycategories: any[] = req.user.assigned_keycategories;
    let result = await KeyCategory.find({ _id: { $in: assigned_keycategories } });
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


export const AssignKeyCategoriesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { categoryids, user_ids, flag } = req.body as { categoryids: string[], user_ids: string[], flag: number }
    if (categoryids && categoryids.length === 0)
        return res.status(400).json({ message: "please select one category " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one user" })

    let owners = user_ids

    if (flag == 0) {
        for (let k = 0; k < owners.length; k++) {
            let owner = await User.findById(owners[k]).populate('assigned_keycategories').populate('assigned_keys');;
            if (owner) {
                let oldcategorys = owner.assigned_keycategories.map((item) => { return item._id.valueOf() });
                oldcategorys = oldcategorys.filter((item) => { return !categoryids.includes(item) });
                let newCategories: IKeyCategory[] = [];

                for (let i = 0; i < oldcategorys.length; i++) {
                    let category = await KeyCategory.findById(oldcategorys[i]);
                    if (category)
                        newCategories.push(category)
                }

                let keys = await Key.find({ category: { $in: newCategories.map(i => { return i.category }) } })

                await User.findByIdAndUpdate(owner._id, {
                    assigned_keycategories: oldcategorys,
                    assigned_keys: keys
                })
            }
        }
    }
    else {
        for (let k = 0; k < owners.length; k++) {
            const user = await User.findById(owners[k]).populate('assigned_keycategories').populate('assigned_keys');
            if (user) {
                let assigned_categorys = user.assigned_keycategories;
                for (let i = 0; i <= categoryids.length; i++) {
                    if (!assigned_categorys.map(i => { return i._id.valueOf() }).includes(categoryids[i])) {
                        let category = await KeyCategory.findById(categoryids[i]);
                        if (category)
                            assigned_categorys.push(category)
                    }
                }

                user.assigned_keycategories = assigned_categorys
                let keys = await Key.find({ category: { $in: assigned_categorys.map(i => { return i.category }) } })
                user.assigned_keys = keys;
                await user.save();
            }

        }
    }

    return res.status(200).json({ message: "successfull" })
}