import { NextFunction, Request, Response } from 'express';
import xlsx from "xlsx";
import { KeyCategory } from '../models/key-category';
import { Key } from '../models/keys';
import { convertDateToExcelFormat, previousYear } from '../utils/datesHelper';

export const test = async (req: Request, res: Response, next: NextFunction) => {


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
        var name = 'DayMonthDA'
        const sheetData: { key: string, category: string, type: string, is_date_key: boolean }[] = xlsx.utils.sheet_to_json(workbook.Sheets[name]);
        console.log(sheetData)
       
        return res.status(200).json("successs");
    }
}