import { NextFunction, Request, Response } from 'express';
import isMongoId from "validator/lib/isMongoId";
import { DropDownDto } from '../dtos/dropdown.dto';
import { GetKeyCategoryDto } from '../dtos/key-category.dto';
import { IKeyCategory, KeyCategory } from '../models/key-category.model';
import { User } from '../models/user.model';



export const GetAllKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    let data: IKeyCategory[] = []
    data = await KeyCategory.find();
    let result: GetKeyCategoryDto[] = [];
    for (let i = 0; i < data.length; i++) {
        let users = await (await User.find({ assigned_keycategories: data[i]._id })).map((i) => { return { _id: i._id.valueOf(), username: i.username } })
        result.push({ _id: data[i]._id, display_name: data[i].display_name, category: data[i].category, skip_bottom_rows: data[i].skip_bottom_rows, assigned_users: String(users.map((u) => { return u.username })) });
    }
    return res.status(200).json(result)
}


export const GetKeyCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id)) {
        return res.status(400).json({ message: "invalid id" })
    }
    let category = await KeyCategory.findById(id)
    let result: DropDownDto | null = null;
    if (category)
        result = { id: category._id, label: category.display_name }
    return res.status(200).json(result)
}

export const GetAllKeyCategoryForDropDown = async (req: Request, res: Response, next: NextFunction) => {
    let assigned_keycategories: any[] = req.user.assigned_keycategories;
    let show_assigned_only = req.query.show_assigned_only
    let data: IKeyCategory[] = []
    if (show_assigned_only)
        data = await KeyCategory.find({ _id: { $in: assigned_keycategories } });
    else
        data = await KeyCategory.find();

    let result: DropDownDto[] = [];
    result = data.map((R) => { return { id: R._id, label: R.display_name, value: R.category } })
    console.log(result)
    return res.status(200).json(result)
}



export const CreateKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    let { key, skip_bottom_rows, display_name } = req.body as { key: string, display_name: string, skip_bottom_rows: number, }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }

    if (await KeyCategory.findOne({ category: key }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new KeyCategory({
        category: key,
        display_name: display_name,
        skip_bottom_rows,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateKeyCategory = async (req: Request, res: Response, next: NextFunction) => {
    let { key, skip_bottom_rows, display_name } = req.body as { key: string, display_name: string, skip_bottom_rows: number, }
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
    oldcategory.display_name = display_name
    oldcategory.skip_bottom_rows = skip_bottom_rows
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
            let owner = await User.findById(owners[k]).populate('assigned_keycategories')
            if (owner) {
                let oldcategorys = owner.assigned_keycategories.map((item) => { return item._id.valueOf() });
                oldcategorys = oldcategorys.filter((item) => { return !categoryids.includes(item) });
                let newCategories: IKeyCategory[] = [];

                for (let i = 0; i < oldcategorys.length; i++) {
                    let category = await KeyCategory.findById(oldcategorys[i]);
                    if (category)
                        newCategories.push(category)
                }
                await User.findByIdAndUpdate(owner._id, {
                    assigned_keycategories: oldcategorys,
                })
            }
        }
    }
    else {
        for (let k = 0; k < owners.length; k++) {
            const user = await User.findById(owners[k])
            if (user) {
                let assigned_categorys: any[] = user.assigned_keycategories;
                for (let i = 0; i < categoryids.length; i++) {
                    if (!assigned_categorys.includes(categoryids[i])) {
                        assigned_categorys.push(categoryids[i])
                    }
                }
                user.assigned_keycategories = assigned_categorys
                await user.save();
            }

        }
    }

    return res.status(200).json({ message: "successfull" })
}