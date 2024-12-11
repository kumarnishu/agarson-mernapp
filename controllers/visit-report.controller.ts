import { NextFunction, Request, Response } from 'express';
import moment from "moment";

import { decimalToTimeForXlsx } from '../utils/datesHelper';
import { GetVisitReportDto } from '../dtos/visit-report.dto';
import { VisitReport } from '../models/visit-report.model';
import { ExcelDBRemark } from '../models/excel-db-remark.model';
import { KeyCategory } from '../models/key-category.model';


export const GetVisitReports = async (req: Request, res: Response, next: NextFunction) => {
    const category=req.query.category
    let dt1 = new Date()
    dt1.setHours(0, 0, 0, 0)
    let dt2 = new Date()

    dt2.setDate(dt1.getDate() + 1)
    dt2.setHours(0)
    dt2.setMinutes(0)
    let cat = await KeyCategory.findOne({ category: category })
    let remarks = await ExcelDBRemark.find({ created_at: { $gte: dt1, $lt: dt2 }, category: cat }).countDocuments()
    return res.status(200).json(remarks);
}


