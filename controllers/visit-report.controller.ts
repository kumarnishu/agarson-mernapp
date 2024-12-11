import { NextFunction, Request, Response } from 'express';
import moment from "moment";

import { decimalToTimeForXlsx } from '../utils/datesHelper';
import { GetVisitReportDto } from '../dtos/visit-report.dto';
import { VisitReport } from '../models/visit-report.model';
import { ExcelDBRemark } from '../models/excel-db-remark.model';


export const GetVisitReports = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date()
    dt1.setHours(0, 0, 0, 0)
    let dt2 = new Date()

    dt2.setDate(dt1.getDate() + 1)
    dt2.setHours(0)
    dt2.setMinutes(0)

    let remarks = await ExcelDBRemark.find({ created_at: { $gte: dt1, $lt: dt2 } }).countDocuments()
    return res.status(200).json(remarks);
}


