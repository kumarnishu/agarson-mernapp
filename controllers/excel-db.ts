import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { IColumnRowData, IRowData } from "../dtos";
import { KeyCategory } from "../models/key-category";
import { Key } from "../models/keys";
import { ExcelDB } from "../models/excel-db";
import { parseExcelDate } from "../utils/datesHelper";
import { decimalToTimeForXlsx } from "../utils/decimalToTimeForXlsx";

export const GetExcelDbReport = async (req: Request, res: Response, next: NextFunction) => {

    const category = req.query.category
    let result: IColumnRowData = {
        columns: [],
        rows: []
    };
    if (!category) {
        return res.status(400).json({ message: 'please select category ' })
    }
    let keys = await Key.find({ category: category });
    for (let k = 0; k < keys.length; k++) {
        let c = keys[k]
        result.columns.push({ key: c.key, header: c.key, type: c.type })
    }

    let data = await ExcelDB.find({ category: category }).sort('-created_at')


    for (let k = 0; k < data.length; k++) {
        let obj: IRowData = {}
        let dt = data[k]
        if (dt) {
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i].key

                //@ts-ignore
                if (dt[key]) {
                    if (keys[i].type == "number")
                        //@ts-ignore
                        obj[key] = Number(dt[key])
                    else if (keys[i].type == "date")
                        //@ts-ignore
                        obj[key] = new Date(parseExcelDate(dt[key]))
                    else if (keys[i].type == "timestamp")
                        //@ts-ignore
                        obj[key] = decimalToTimeForXlsx(dt[key])
                    else
                        //@ts-ignore
                        obj[key] = dt[key]

                }
                else {
                    if (keys[i].type == "number")
                        obj[key] = 0
                    else
                        obj[key] = ""
                }
            }
        }
        result.rows.push(obj)
    }

    return res.status(200).json(result)
}


export const CreateExcelDBFromExcel = async (req: Request, res: Response, next: NextFunction) => {
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
            const sheetData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 4 });

            if (worksheet && sheetData) {
                let columns = await Key.find({ category: sheetName });

                if (columns && sheetData) {
                    await ExcelDB.deleteMany({ category: sheetName });

                    for (let j = 0; j < sheetData.length - 3; j++) {
                        let obj: any = {};
                        obj.category = sheetName;

                        for (let k = 0; k < columns.length; k++) {
                            let column = columns[k];
                            obj.key = column;
                            obj[String(column.key)] = sheetData[j][column.key];
                        }

                        await new ExcelDB(obj).save();
                    }
                }
            }
        }
    }
    return res.status(200).json("successs");
}


