import { NextFunction, Request, Response } from 'express';
import { GetKeyDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { IKey, Key } from '../models/keys';
import { User } from '../models/user';

export const GetAllKey = async (req: Request, res: Response, next: NextFunction) => {
    let category = req.query.category;

    let data: IKey[]
    if (category == 'all')
        data = await Key.find().populate('category').sort("key");
    else
        data = await Key.find({ category: category }).populate('category').sort("key");



    let result: GetKeyDto[] = [];

    for (let i = 0; i < data.length; i++) {
        let users = await (await User.find({ assigned_keys: data[i]._id })).
            map((i) => { return { _id: i._id.valueOf(), username: i.username } })
        result.push(
            {
                _id: data[i]._id,
                key: data[i].key,
                type: data[i].type,
                category: data[i].category.category,
                assigned_users: String(users.map((u) => { return u.username }))
            });
    }
    return res.status(200).json(result)
}


export const CreateKey = async (req: Request, res: Response, next: NextFunction) => {
    let { key, category, type } = req.body as { key: string, category: string, type: string }
    if (!category || !key || !type) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Key.findOne({ key: key, category: category }))
        return res.status(400).json({ message: "already exists this key" })


    let result = await new Key({
        key,
        type,
        category: category,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateKey = async (req: Request, res: Response, next: NextFunction) => {
    let { key, category, type } = req.body as {
        key: string,
        category: string,
        type: string,
    }
    if (!category || !key || !type) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }


    const id = req.params.id
    let oldkey = await Key.findById(id)
    if (!oldkey)
        return res.status(404).json({ message: "key not found" })

    if (oldkey.key !== key)
        if (await Key.findOne({ key: key, category: category }))
            return res.status(400).json({ message: "already exists this key" })

    await Key.findByIdAndUpdate(id, {
        key,
        type,
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

export const AssignKeysToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { key_ids, user_ids, flag } = req.body as {
        user_ids: string[],
        key_ids: string[],
        flag: number
    }
    if (key_ids && key_ids.length === 0)
        return res.status(400).json({ message: "please select one employee " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one user" })

    let owners = user_ids

    if (flag == 0) {
        for (let i = 0; i < owners.length; i++) {
            let owner = await User.findById(owners[i]).populate('assigned_keys');
            if (owner) {
                let oldemps = owner.assigned_keys.map((item) => { return item._id.valueOf() });
                oldemps = oldemps.filter((item) => { return !key_ids.includes(item) });
                await User.findByIdAndUpdate(owner._id, {
                    assigned_keys: oldemps
                })
            }
        }
    }
    else for (let k = 0; k < owners.length; k++) {
        const user = await User.findById(owners[k])
        if (user) {
            let assigned_keys: any[] = user.assigned_keys;
            for (let i = 0; i < key_ids.length; i++) {
                if (!assigned_keys.includes(key_ids[i])) {
                    assigned_keys.push(key_ids[i])
                }
            }
            user.assigned_keys = assigned_keys
            await user.save();
        }

    }

    return res.status(200).json({ message: "successfull" })
}