import { NextFunction, Request, Response, Router } from 'express';
import express from 'express'
import { KeyCategory } from '../models/key-category.model';
import { ExcelDBRemark } from '../models/excel-db-remark.model';
import { Reference } from '../models/references.model';
import { Dye } from '../models/dye.model';
import { Checklist } from '../models/checklist.model';
import { ChecklistBox, IChecklistBox } from '../models/checklist-box.model';

export class TestController {

    public async test(req: Request, res: Response, next: NextFunction) {
        let dt1 = new Date()
        dt1.setHours(0, 0, 0, 0)
        let dt2 = new Date()

        dt2.setDate(dt1.getDate() + 1)
        dt2.setHours(0)
        dt2.setMinutes(0)
        let checklists = await Checklist.find({})
        for (let i = 0; i < checklists.length; i++) {
            let ch = checklists[i]
            let boxes: IChecklistBox[] = []
            if (ch.frequency == 'daily')
                boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(5)
            if (ch.frequency == 'monthly')
                boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(2)
            if (ch.frequency == 'weekly')
                boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(3)
            if (ch.frequency == 'yearly')
                boxes = await ChecklistBox.find({ checklist: checklists[i], date: { $lt: dt2 } }).sort("-date").limit(2)
            //@ts-ignore
            boxes.sort((a, b) => new Date(a.date) - new Date(b.date));
            ch.last_10_boxes = boxes
            await ch.save()
        }
        return res.status(200).json({ message: "success" })

    }

}