import { NextFunction, Request, Response } from 'express';
import { GetKeyDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { Key } from '../models/keys';
import moment from 'moment';
import { User } from '../models/user';

export const GetAllKey = async (req: Request, res: Response, next: NextFunction) => {
    let result = await Key.find().populate('category').populate('created_by').populate('updated_by').sort("key");
    let data: GetKeyDto[];

    data = result.map((r) => {
        return {
            _id: r._id,
            key: r.key,
            type: r.type,
            category: { id: r.category._id, value: r.category.category, label: r.category.category },
            created_at: moment(r.created_at).format("DD/MM/YYYY"),
            updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
            created_by: { id: r._id, value: r.created_by.username, label: r.created_by.username },
            updated_by: { id: r._id, value: r.updated_by.username, label: r.updated_by.username }
        }
    });
    return res.status(200).json(data)
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
        const user = await User.findById(owners[k]).populate('assigned_keys')
        if (user) {
            let assigned_keys = user.assigned_keys;
            for (let i = 0; i <= key_ids.length; i++) {
                if (!assigned_keys.map(i => { return i._id.valueOf() }).includes(key_ids[i])) {
                    let emp = await Key.findById(key_ids[i]);
                    if (emp)
                        assigned_keys.push(emp)
                }
            }

            user.assigned_keys = assigned_keys
            await user.save();
        }

    }
}