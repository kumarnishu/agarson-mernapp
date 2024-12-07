import { NextFunction, Request, Response } from 'express';
import { Checklist } from '../models/checklist.model';
import { ChecklistBox } from '../models/checklist-box.model';

export const test = async (req: Request, res: Response, next: NextFunction) => {

    let works = await Checklist.find({ frequency: 'monthly' })
    let dt1 = new Date()
    dt1.setDate(1)
    dt1.setHours(0, 0, 0, 0)
    let dt2 = new Date()
    dt2.setDate(dt1.getDate() + 1)
    dt2.setHours(0, 0, 0, 0)
    for (let i = 0; i < works.length; i++) {
        let work = works[i];
        let box = await ChecklistBox.findOne({ checklist: works[i], date: { $gte: dt1, $lt: dt2 } })
        if (box) {
            let boxes = work.last_10_boxes
            boxes.pop()
            boxes.push(box)
            work.last_10_boxes = boxes;
            await work.save();
        }
    }


    return res.status(200).json("success")
}