import { NextFunction, Request, Response } from 'express';
import { GetKeyDto, GetKeyFromExcelDto } from "../dtos";
import isMongoId from "validator/lib/isMongoId";
import { IKey, Key } from '../models/keys';
import { User } from '../models/user';
import xlsx from "xlsx"
import { KeyCategory } from '../models/key-category';
import ConvertJsonToExcel from '../utils/ConvertJsonToExcel';
import { convertDateToExcelFormat } from '../utils/datesHelper';

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
                serial_no: data[i].serial_no,
                key: data[i].key,
                type: data[i].type,
                category: { id: data[i].category._id, label: data[i].category.category, value: data[i].category.category },
                is_date_key:data[i].is_date_key,
                map_to_state:data[i].map_to_state,
                map_to_username:data[i].map_to_username,
                assigned_users: String(users.map((u) => { return u.username }))
            });
    }
    return res.status(200).json(result)
}


export const CreateKey = async (req: Request, res: Response, next: NextFunction) => {
    let { key, category, type, serial_no, is_date_key,
        map_to_state,
        map_to_username, } = req.body as {
        key: string, category: string, type: string, serial_no: number, is_date_key: false,
        map_to_username: false,
        map_to_state: false }
    if (!category || !key || !type) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Key.findOne({ key: key, category: category }))
        return res.status(400).json({ message: "already exists this key" })


    let result = await new Key({
        key,
        type,
        serial_no,
        is_date_key,
        map_to_state,
        map_to_username,
        category: category,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateKey = async (req: Request, res: Response, next: NextFunction) => {
    let { key, category, type, serial_no, is_date_key,
        map_to_state,
        map_to_username, } = req.body as {
        key: string,
        category: string,
        type: string,
        serial_no: number, is_date_key: false,
        map_to_username: false,
        map_to_state: false
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
        serial_no,
        type,
        is_date_key,
        map_to_state,
        map_to_username,
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
export const CreateKeysFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetKeyFromExcelDto[] = []
    let statusText: string = ""
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetKeyFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        let end_date = new Date();
        end_date.setFullYear(end_date.getFullYear() + 30)
        for (let i = 0; i < workbook_response.length; i++) {
            let keyItem = workbook_response[i]
            let serial_no: number | null = keyItem.serial_no
            let key: string | null = keyItem.key
            let type: string | null = keyItem.type
            let category: string | null = keyItem.category
            let _id: string | undefined = keyItem._id
            let is_date_key: boolean | null = keyItem.is_date_key
            let map_to_username: boolean | null = keyItem.map_to_username
            let map_to_state: boolean | null = keyItem.map_to_state

            if (is_date_key == true) {
                key = convertDateToExcelFormat(key)
            }

            let validated = true

            //important
            if (!key) {
                validated = false
                statusText = "required key"
            }
            if (!serial_no) {
                validated = false
                statusText = "required serial_no"
            }
            if (!category) {
                validated = false
                statusText = "required category"
            }
            if (!type) {
                validated = false
                statusText = "required type"
            }
            if (type && !['number', 'string', 'date', 'timestamp', 'boolean'].includes(type)) {
                validated = false
                statusText = `invalid type`
            }
            if (category) {
                let cat = await KeyCategory.findOne({ category: category })
                if (!cat) {
                    validated = false
                    statusText = "category not found"
                }
                else
                    category = cat._id
            }
            console.log(keyItem)
            if (validated) {
                if (_id && isMongoId(String(_id))) {
                    let ch = await Key.findById(_id)
                    if (ch?.key !== key) {
                        if (await Key.findOne({ key: key, category: category })) {
                            validated = false
                            statusText = `key ${key} exists`
                        }
                    }
                    else {
                        await Key.findByIdAndUpdate(_id, {
                            key,
                            serial_no,
                            type,
                            is_date_key: is_date_key ? true : false,
                            map_to_username: map_to_username ? true : false,
                            map_to_state: map_to_state ? true : false,
                            category: category,
                            updated_at: new Date(),
                            updated_by: req.user
                        })
                        statusText = "updated"
                    }
                }
                else {
                    let keyl = await Key.findOne({ key: key, category: category })
                    if (keyl) {
                        validated = false
                        statusText = `${keyl.key} already exists`
                    }
                    else {
                        await new Key({
                            key,
                            serial_no,
                            type,
                            is_date_key: is_date_key ? true : false,
                            map_to_username: map_to_username ? true : false,
                            map_to_state: map_to_state ? true : false,
                            category: category,
                            created_by: req.user,
                            updated_by: req.user,
                            updated_at: new Date(Date.now()),
                            created_at: new Date(Date.now())
                        }).save()
                        statusText = "created"
                    }
                }


            }
            result.push({
                ...keyItem,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}
export const DownloadExcelTemplateForCreateKeys = async (req: Request, res: Response, next: NextFunction) => {
    let keys: GetKeyFromExcelDto[] = [{
        _id: "umc3m9344343vn934",
        serial_no: 1,
        key: 'Employee Name',
        category: 'visitsummary',
        type: 'string',
        is_date_key: false,
        map_to_username: false,
        map_to_state: false
    }]
    let data = (await Key.find().populate('category')).map((u) => {
        return {
            _id: u._id.valueOf(),
            serial_no: u.serial_no,
            key: u.key,
            type: u.type,
            category: u.category.category,
            is_date_key: u.is_date_key,
            map_to_username: u.map_to_username,
            map_to_state: u.map_to_state
        }
    })
    if (data.length > 0) {
        keys = data
    }
    let categories = (await KeyCategory.find()).map((u) => { return { name: u.category } })

    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data: keys })
    template.push({ sheet_name: 'categories', data: categories })
    template.push({ sheet_name: 'types', data: [{ type: "string" }, { type: "number" }, { type: "date" }, { type: "timestamp" }, { type: 'boolean' }] })
    ConvertJsonToExcel(template)
    let fileName = "CreateKeysTemplate.xlsx"
    return res.download("./file", fileName)
}