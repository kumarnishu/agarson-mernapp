import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { IColumnRowData, IRowData } from "../dtos";
import { IKeyCategory, KeyCategory } from "../models/key-category";
import { Key } from "../models/keys";
import { ExcelDB } from "../models/excel-db";
import { decimalToTimeForXlsx, excelSerialToDate, invalidate, parseExcelDate } from "../utils/datesHelper";
import { ICRMState } from "../models/crm-state";
import { User } from "../models/user";
import { ExcelDBRemark } from "../models/excel-db-remark";
import moment from "moment";

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



    for (let k = 0; k < keys.length; k++) {
        let c = keys[k]
        result.columns.push({ key: c.key, header: c.key, type: c.type })
    }

    if (cat && cat.category == 'BillsAge') {
        result.columns.push({ key: 'last remark', header: 'Last Remark', type: 'string' })
        result.columns.push({ key: 'next call', header: 'Next Call', type: 'string' })
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
                        else
                            //@ts-ignore
                            obj[key] = dt[key]
                        if (key == 'Account Name') {
                            //@ts-ignore
                            let lastremark = await ExcelDBRemark.findOne({ category: category, obj: dt[key] })
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
                        console.log(keys[rk])
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
    }
    if (result.length > 0)
        return res.status(200).json(result);
    else
        return res.status(200).json([]);
}


