import { NextFunction, Request, Response } from 'express';
import xlsx from "xlsx";
import { CreateChecklistCategory } from './checklist-category';
import { Checklist } from '../models/checklist';
import { ChecklistCategory } from '../models/checklist-category';

export const test = async (req: Request, res: Response, next: NextFunction) => {

    let categories = await ChecklistCategory.find()
    await Checklist.deleteMany({ category: { $nin: categories } })


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
       //
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets['visitsummary'];

        const data:any[] = xlsx.utils.sheet_to_json(worksheet, { header: 4 }); 
        const headers = data[4]; // 3rd row (index 2)
        const rowData = data.slice(6); 

        console.log(rowData)
        console.log(headers)
       
        if (data.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        

    }


    return res.status(200).json("successs");
}