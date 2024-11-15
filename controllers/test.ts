import { NextFunction, Request, Response } from 'express';
import xlsx from "xlsx";
import { KeyCategory } from '../models/key-category';
import { Key } from '../models/keys';
import { ExcelDB, IExcelDb } from '../models/excel-db';
import { Checklist } from '../models/checklist';
import { previousYear } from '../utils/datesHelper';
import { ChecklistBox } from '../models/checklist-box';

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

        const sheetData: { key: string, category: string, type: string }[] = xlsx.utils.sheet_to_json(workbook.Sheets[workbook_sheet[0]]);

        for (let i = 0; i < sheetData.length; i++) {
            let sheet = sheetData[i]
            let key: string | null = sheet.key
            let type: string | null = sheet.type
            let category: string | null = sheet.category

            let cat = await KeyCategory.findOne({ category: category })
            if (cat) {
                if (!await Key.findOne({ key: key, category: cat })) {
                    await new Key({
                        key,
                        type,
                        category: cat,
                        created_by: req.user,
                        updated_by: req.user,
                        updated_at: new Date(),
                        created_at: new Date(),
                    }).save()
                }
            }
        }
        return res.status(200).json("successs");
    }
}