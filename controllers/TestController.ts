import { NextFunction, Request, Response, Router } from 'express';
import express from 'express'
import { KeyCategory } from '../models/key-category.model';
import { ExcelDBRemark } from '../models/excel-db-remark.model';
import { Reference } from '../models/references.model';
import { Dye } from '../models/dye.model';
import { Checklist } from '../models/checklist.model';
import { ChecklistBox, IChecklistBox } from '../models/checklist-box.model';

export class TestController {

    //     public async test(req: Request, res: Response, next: NextFunction) {
    //         let dt1 = new Date()
    //         dt1.setHours(0, 0, 0, 0)
    //         let dt2 = new Date()

    //         dt2.setDate(dt1.getDate() + 1)
    //         dt2.setHours(0)
    //         dt2.setMinutes(0)
    //         let checklists = await Checklist.find({})
    //         for (let i = 0; i < checklists.length; i++) {
    //             let ch = checklists[i]
    //             let boxes: IChecklistBox[] = []
    //             if (ch.frequency == 'daily')
    //                 boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(5)
    //             if (ch.frequency == 'monthly')
    //                 boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(2)
    //             if (ch.frequency == 'weekly')
    //                 boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(3)
    //             if (ch.frequency == 'yearly')
    //                 boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(2)
    //             //@ts-ignore
    //             boxes.sort((a, b) => new Date(a.date) - new Date(b.date));
    //             ch.last_10_boxes = boxes
    //             await ch.save()
    //         }
    //         return res.status(200).json({ message: "success" })

    //     }

    // }


    public async test(req: Request, res: Response, next: NextFunction) {
        try {
            const documents = await Checklist.find({}, '_id').sort({ _id: 1 });

            for (let i = 0; i < documents.length; i++) {
                let ch = documents[i]
                ch.serial_no = Number(ch.serial_no)
                await ch.save()
            }
            // const dt1 = new Date();
            // dt1.setHours(0, 0, 0, 0);

            // const dt2 = new Date(dt1);
            // dt2.setDate(dt2.getDate() + 1);
            // const cat = req.query.category
            // // Pre-fetch all checklists
            // const checklists = await Checklist.find({ category: cat });

            // const frequencyLimits: Record<string, number> = {
            //     daily: 5,
            //     weekly: 3,
            //     monthly: 2,
            //     yearly: 2,
            // };

            // // Process each checklist
            // const checklistUpdates = checklists.map(async (ch) => {
            //     const limit = frequencyLimits[ch.frequency] || 0;

            //     if (limit > 0) {
            //         const boxes = await ChecklistBox.find({
            //             checklist: ch._id,
            //             date: { $lt: dt2 }
            //         })
            //             .sort({ date: -1 }) // Sort by date descending
            //             .limit(limit);

            //         ch.last_10_boxes = boxes.reverse(); // Reverse to have ascending order
            //         return ch.save();
            //     }
            // });

            // // Await all save operations
            // await Promise.all(checklistUpdates);

            return res.status(200).json({ message: "success" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}