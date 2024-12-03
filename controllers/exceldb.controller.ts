// External Libraries
import xlsx from 'xlsx';
import { NextFunction, Request, Response } from 'express';
import isMongoId from 'validator/lib/isMongoId';
import moment from 'moment';

// Models
import { IKeyCategory, KeyCategory } from '../models/key-category';
import { Key, IKey } from '../models/keys';
import { ExcelDBRemark, IExcelDBRemark } from '../models/excel-db-remark';
import { ICRMState } from '../models/crm-state';
import { IUser, User } from '../models/user';
import { VisitReport } from '../models/visit-report';

// DTOs
import { IColumnRowData, IRowData, DropDownDto, GetKeyCategoryDto, GetKeyDto, GetKeyFromExcelDto, CreateOrEditExcelDbRemarkDto, GetExcelDBRemarksDto } from '../dtos';

// Utilities
import { decimalToTimeForXlsx, excelSerialToDate, invalidate, parseExcelDate, convertDateToExcelFormat } from '../utils/datesHelper';
import ConvertJsonToExcel from '../utils/ConvertJsonToExcel';
import { ExcelDB } from '../models/excel-db';


export const GetExcelDbReport = async (req: Request, res: Response, next: NextFunction) => {
    const category = req.query.category
    let result: IColumnRowData = {
        columns: [],
        rows: []
    };
    if (!category) {
        return res.status(400).json({ message: 'please select category ' })
    }
    let cat: IKeyCategory | null = null
    cat = await KeyCategory.findById(category)
    if (cat) {
        if (cat && cat.category == 'BillsAge')
            result.columns.push({ key: 'action', header: 'Action', type: 'action' })
        else if (cat && cat.category == 'PartyTarget')
            result.columns.push({ key: 'action', header: 'Action', type: 'action' })
    }

    let assigned_keys: any[] = req.user.assigned_keys;
    let assigned_states: string[] = []
    let user = await User.findById(req.user._id).populate('assigned_crm_states')
    user && user?.assigned_crm_states.map((state: ICRMState) => {
        assigned_states.push(state.state)
        if (state.alias1)
            assigned_states.push(state.alias1)
        if (state.alias2)
            assigned_states.push(state.alias2)
    });
    let assigned_employees: string[] = [String(req.user.username), String(req.user.alias1 || ""), String(req.user.alias2 || "")].filter(value => value)



    let keys = await Key.find({ category: category, _id: { $in: assigned_keys } }).sort('serial_no');


    //data push for assigned keys
    let data = await ExcelDB.find({ category: category }).populate('key').sort('created_at')

    let maptoemployeekeys = await Key.find({ map_to_username: true, category: category }).sort('serial_no');
    let maptostateskeys = await Key.find({ map_to_state: true, category: category }).sort('serial_no');

    if (req.user.assigned_users && req.user?.assigned_users.length > 0) {
        req.user.assigned_users.map((u: any) => {
            assigned_employees.push(u.username)
            if (u.alias1)
                assigned_employees.push(u.alias1)
            if (u.alias2)
                assigned_employees.push(u.alias2)
        })
    }
    // filter for states
    if (maptostateskeys && maptostateskeys.length > 0)
        data = data.filter((dt) => {
            let matched = false;
            maptostateskeys.forEach((key) => {
                //@ts-ignore
                if (assigned_states.includes(String(dt[key.key]).trim().toLowerCase())) {
                    matched = true
                }
            })
            if (matched) {
                return dt;
            }
        })

    //filter for employees
    if (maptoemployeekeys && maptoemployeekeys.length > 0)
        data = data.filter((dt) => {
            let matched = false;
            maptoemployeekeys.forEach((key) => {
                //@ts-ignore
                if (assigned_employees.includes(String(dt[key.key]).trim().toLowerCase())) {
                    matched = true
                }
            })
            if (matched) {
                return dt;
            }
        })

    if (cat && cat.category == 'BillsAge') {
        result.columns.push({ key: 'last remark', header: 'Last Remark', type: 'string' })
        result.columns.push({ key: 'next call', header: 'Next Call', type: 'string' })
    }
    else if (cat && cat.category == 'PartyTarget') {
        {
            result.columns.push({ key: 'last remark', header: 'Last Remark', type: 'string' })
            result.columns.push({ key: 'next call', header: 'Next Call', type: 'string' })
        }
    }

    for (let k = 0; k < keys.length; k++) {
        let c = keys[k]
        result.columns.push({ key: c.key, header: c.key, type: c.type })
    }



    for (let k = 0; k < data.length; k++) {
        let obj: IRowData = {}
        let dt = data[k]

        if (dt) {
            for (let i = 0; i < keys.length; i++) {
                if (assigned_keys.includes(keys[i]._id)) {
                    let key = keys[i].key
                    //@ts-ignore
                    if (dt[key]) {
                        if (keys[i].type == "timestamp")
                            //@ts-ignore
                            obj[key] = decimalToTimeForXlsx(dt[key])
                        else if (keys[i].type == "date") {
                            if (cat && cat.category == 'SalesRep' && key == 'Sales Representative') {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("MMM-YY")
                            }
                            else {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("DD/MM/YYYY")
                            }
                        }
                        else
                            //@ts-ignore
                            obj[key] = dt[key]

                        //adding bills age actions
                        if (cat && cat.category == 'BillsAge' && key == 'Account Name') {
                            //@ts-ignore
                            let lastremark = await ExcelDBRemark.findOne({ category: category, obj: dt[key] }).sort('-created_at')
                            if (lastremark) {
                                obj['last remark'] = lastremark.remark
                                if (lastremark.next_date)
                                    obj['next call'] = moment(lastremark.next_date).format('DD/MM/YYYY')
                            }
                        }
                        if (cat && cat.category == 'PartyTarget' && key == 'PARTY') {
                            //@ts-ignore
                            let lastremark = await ExcelDBRemark.findOne({ category: category, obj: dt[key] }).sort('-created_at')
                            if (lastremark) {
                                obj['last remark'] = lastremark.remark
                                if (lastremark.next_date)
                                    obj['next call'] = moment(lastremark.next_date).format('DD/MM/YYYY')
                            }
                        }
                    }
                    else {
                        if (keys[i].type == "number")
                            obj[key] = 0
                        else
                            obj[key] = ""
                    }
                }

            }


        }


        result.rows.push(obj)
    }
    return res.status(200).json(result)
}


async function SaveVisistReports(user: IUser) {
    let salesman: IUser[] = []
    salesman = await User.find({ assigned_permissions: 'sales_menu' })
    let cat = await KeyCategory.findOne({ category: 'visitsummary' })
    for (let i = 0; i < salesman.length; i++) {
        let names = [String(salesman[i].username), String(salesman[i].alias1 || ""), String(salesman[i].alias2 || "")].filter(value => value)

        const regexNames = names.map(name => new RegExp(`^${name}$`, 'i'));
        let records = await ExcelDB.find({ category: cat, 'Employee Name': { $in: regexNames } })
        let found = 0;
        let notfound = 0;
        for (let k = 0; k < records.length; k++) {
            let employee = salesman[i];
            //@ts-ignore
            let date = records[k]["Visit Date"]
            let dt1 = new Date(date)
            let dt2 = new Date(dt1)
            dt1.setHours(0, 0, 0, 0)
            dt2.setHours(0, 0, 0, 0)
            dt2.setDate(dt1.getDate() + 1)
            //@ts-ignore
            let intime = records[k]['In Time'];
            let report = await VisitReport.findOne({ employee: employee, visit_date: { $gte: dt1, $lt: dt2 }, intime: intime })
            if (report)
                found++
            else {
                await new VisitReport({
                    employee: employee,
                    visit_date: new Date(date),
                    //@ts-ignore
                    customer: records[k]["Customer Name"],
                    //@ts-ignore
                    intime: records[k]["In Time"],
                    //@ts-ignore
                    outtime: records[k]["Out Time"],
                    //@ts-ignore
                    visitInLocation: records[k]["Visit In Location"],
                    //@ts-ignore
                    visitOutLocation: records[k]["Visit Out Location"],
                    //@ts-ignore
                    remarks: records[k]["Remarks"],
                    created_at: new Date(),
                    updated_at: new Date(),
                    created_by: user,
                    updated_by: user,
                }).save()
                notfound++
            }


        }
    }
}

export const CreateExcelDBFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: { key: string, category: string, problem: string }[] = []
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

        let categories = await KeyCategory.find();
        for (let i = 0; i < categories.length; i++) {
            let sheetName = categories[i];
            const worksheet = workbook.Sheets[sheetName.category];
            const sheetData: any[] = xlsx.utils.sheet_to_json(worksheet, { raw: true });


            if (worksheet && sheetData) {
                let columns = await Key.find({ category: sheetName });
                let keys: any = xlsx.utils.sheet_to_json(worksheet, { header: 1, raw: false })[0];
                const remotekeys = columns.map((c) => { return c.key })

                if (Array.isArray(keys)) {
                    for (let rk = 0; rk < keys.length; rk++) {
                        if (keys[rk] && !remotekeys.includes(keys[rk]))
                            result.push({ key: keys[rk], category: sheetName.category, problem: "not found" })
                    }
                }

                if (columns && sheetData) {
                    await ExcelDB.deleteMany({ category: sheetName });

                    for (let j = 0; j < sheetData.length - sheetName.skip_bottom_rows || 0; j++) {
                        let obj: any = {};
                        obj.category = sheetName;

                        for (let k = 0; k < columns.length; k++) {
                            let column = columns[k];
                            if (column && column.key) {
                                if (column.type == 'date') {
                                    obj.key = column;
                                    obj[String(column.key)] = new Date(excelSerialToDate(sheetData[j][column.key])) > invalidate ? new Date(excelSerialToDate(sheetData[j][column.key])) : parseExcelDate(sheetData[j][column.key])
                                }
                                else {
                                    obj.key = column;
                                    obj[String(column.key)] = sheetData[j][column.key];
                                }
                            }

                        }
                        if (obj['key'])
                            await new ExcelDB(obj).save();
                    }
                }
            }
        }
        await SaveVisistReports(req.user)
    }

    if (result.length > 0)
        return res.status(200).json(result);
    else
        return res.status(200).json([]);
}




export const UpdateExcelDBRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, next_date } = req.body as CreateOrEditExcelDbRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ExcelDBRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    rremark.remark = remark
    if (next_date)
        rremark.next_date = new Date(next_date)
    await rremark.save()
    return res.status(200).json({ message: "remark updated successfully" })
}

export const DeleteExcelDBRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ExcelDBRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}


export const GetExcelDBRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const obj = req.query.obj
    let remarks: IExcelDBRemark[] = []
    let result: GetExcelDBRemarksDto[] = []

    if (!isMongoId(id)) return res.status(400).json({ message: "id not valid" })
    if (!obj) return res.status(404).json({ message: "obj not found" })

    remarks = await ExcelDBRemark.find({ category: id, obj: String(obj).trim().toLowerCase() }).populate('category').populate('created_by').sort('-created_at')

    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            obj: r.obj,
            category: { id: r.category._id, value: r.category.category, label: r.category.category },
            next_date: r.next_date ? moment(r.next_date).format('DD/MM/YYYY') : "",
            created_date: r.created_at.toString(),
            created_by: r.created_by.username
        }
    })
    return res.json(result)
}

export const NewExcelDBRemark = async (req: Request, res: Response, next: NextFunction) => {
    const {
        remark,
        category,
        obj,
        next_date } = req.body as CreateOrEditExcelDbRemarkDto
    if (!remark || !category || !obj) return res.status(403).json({ message: "please fill required fields" })

    let categoryObj = await KeyCategory.findById(category)
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }

    let new_remark = new ExcelDBRemark({
        remark,
        obj,
        category: categoryObj,
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    if (next_date)
        new_remark.next_date = new Date(next_date)
    await new_remark.save()
    return res.status(200).json({ message: "remark added successfully" })
}

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
        result = { id: category._id, label: category.display_name, value: category.category }
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
                is_date_key: data[i].is_date_key,
                map_to_state: data[i].map_to_state,
                map_to_username: data[i].map_to_username,
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
            map_to_state: false
        }
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
    let cat = req.query.category
    let data: GetKeyFromExcelDto[] = []
    if (cat !== 'all') {
        data = (await Key.find({ category: cat }).populate('category')).map((u) => {
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
    }
    else {
        data = (await Key.find().populate('category')).map((u) => {
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
    }

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