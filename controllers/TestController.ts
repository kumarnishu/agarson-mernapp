import { NextFunction, Request, Response, Router } from 'express';
import express from 'express'
import { KeyCategory } from '../models/key-category.model';
import { ExcelDBRemark } from '../models/excel-db-remark.model';
import { Reference } from '../models/references.model';
import { Dye } from '../models/dye.model';

export class TestController {

    public async test(req: Request, res: Response, next: NextFunction) {

        await Dye.updateMany(
            {}, // Empty filter matches all documents
            { $inc: { stdshoe_weight: -100 } } // Decrease stdshoe_weight by 100
        );
        // const category = req.query.category
        // let dt1 = new Date()
        // dt1.setHours(0, 0, 0, 0)
        // let dt2 = new Date()

        // dt2.setDate(dt1.getDate() + 1)
        // dt2.setHours(0)
        // dt2.setMinutes(0)
        // let cat = await KeyCategory.findOne({ category: category })
        // let remarks = await ExcelDBRemark.find({
        //     created_at: { $gte: dt1, $lt: dt2 },
        //     category: cat
        // })
        //     .populate({
        //         path: 'created_by',
        //         select: 'username' // Specify the fields to fetch from the populated model
        //     })
        //     .select('remark obj created_at');

        // return res.status(200).json({
        //     total: await ExcelDBRemark.find({ category: cat }).count(),
        //     today: remarks.length,
        //     remarks: remarks
        // });
        return res.status(200).json({ message: "success" })

    }

}