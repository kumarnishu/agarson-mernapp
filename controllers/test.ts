import { NextFunction, Request, Response } from 'express';
import xlsx from "xlsx";
import { KeyCategory } from '../models/key-category';
import { Key } from '../models/keys';
import { ExcelDB, IExcelDb } from '../models/excel-db';
import { Checklist } from '../models/checklist';
import { previousYear } from '../utils/datesHelper';
import { ChecklistBox } from '../models/checklist-box';

export const test = async (req: Request, res: Response, next: NextFunction) => {
    let today = new Date()
    today.setDate(15)
    today.setHours(0,0,0,0)
    let checklists = await Checklist.find()
    for (let i = 0; i < checklists.length; i++) {
        let ch = checklists[i]
        let boxes = await ChecklistBox.find({ checklist:checklists[i],date: { $gte: previousYear, $lte: today } })
        if (ch.frequency == "monthly" || ch.frequency == "yearly"){
            let finalboxes = boxes.slice(-3).map((bo) => {
                return {
                    _id: bo._id,
                    stage: bo.stage,
                    last_remark: bo.last_remark,
                    checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                    date: bo.date.toString()
                }
            })
            //@ts-ignore
            ch.last_10_boxes = finalboxes
            await ch.save();
        }
       else{
            let finalboxes = boxes.slice(-6).map((bo) => {
                return {
                    _id: bo._id,
                    stage: bo.stage,
                    last_remark: bo.last_remark,
                    checklist: { id: ch._id, label: ch.work_title, value: ch.work_title },
                    date: bo.date.toString()
                }
            })
            //@ts-ignore
            ch.last_10_boxes = finalboxes
            await ch.save();
       }
    }

    // let dt1 = new Date()
    // dt1.setHours(0)
    // dt1.setMinutes(0)
    // let dt2 = new Date()
    // dt2.setDate(dt1.getDate() + 1)
    // dt2.setHours(0)
    // dt2.setMinutes(0)
    // let works = await Checklist.find({ frequency: 'daily' });
    // for (let i = 0; i < works.length; i++) {
    //     let work = works[i]
    //     let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: dt1, $lt: dt2 } })
    //     if (box) {
    //         let boxes = work.last_10_boxes.slice(1)
    //         boxes.push(box)
    //         work.last_10_boxes = boxes;
    //         await work.save();
    //     }
        
    // }

    // if (!req.file)
    //     return res.status(400).json({
    //         message: "please provide an Excel file",
    //     });
    // if (req.file) {
    //     const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
    //     if (!allowedFiles.includes(req.file.mimetype))
    //         return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
    //     if (req.file.size > 100 * 1024 * 1024)
    //         return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
    //     const workbook = xlsx.read(req.file.buffer);

    //     let categories = await KeyCategory.find();
    //     for (let i = 0; i < categories.length; i++) {
    //         let sheetName = categories[i];
    //         const worksheet = workbook.Sheets[sheetName.category];
    //         const sheetData: any[] = xlsx.utils.sheet_to_json(worksheet, { header: 4 });

    //         if (worksheet && sheetData) {
    //             let columns = await Key.find({ category: sheetName });

    //             if (columns && sheetData) {
    //                 await ExcelDB.deleteMany({ category: sheetName });

    //                 for (let j = 0; j < sheetData.length - 3; j++) {
    //                     let obj: any = {};
    //                     obj.category = sheetName;

    //                     for (let k = 0; k < columns.length; k++) {
    //                         let column = columns[k];
    //                         obj.key = column;
    //                         obj[String(column.key)] = sheetData[j][column.key];
    //                     }

    //                     await new ExcelDB(obj).save();
    //                 }
    //             }
    //         }
    //     }
    // }
    return res.status(200).json("successs");
}