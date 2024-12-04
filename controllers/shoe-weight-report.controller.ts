import { NextFunction, Request, Response } from 'express';

import moment from 'moment';
import { GetShoeWeightDiffReportDto } from '../dtos/shoe-weight.dto';
import { IShoeWeight, ShoeWeight } from '../models/shoe-weight.model';

export const GetShoeWeightDifferenceReports = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let weights: IShoeWeight[] = []
    let reports: GetShoeWeightDiffReportDto[] = []
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("dye.dye_number")
    reports = weights.map((weight) => {
        return {
            date: moment(weight.created_at).format("DD/MM/YYYY"),
            dye_no: weight.dye.dye_number,
            article: weight.article.display_name,
            size: weight.dye.size,
            st_weight: weight.dye.stdshoe_weight || 0,
            machine: weight.machine.display_name,
            w1: weight.shoe_weight1 || 0,
            w2: weight.shoe_weight2 || 0,
            w3: weight.shoe_weight3 || 0,
            u1: weight.upper_weight1 || 0,
            u2: weight.upper_weight2 || 0,
            u3: weight.upper_weight3 || 0,
            d1: weight.shoe_weight1 && weight.upper_weight1 ? (weight.shoe_weight1 - weight.upper_weight1 - weight.dye.stdshoe_weight) : 0,
            d2: weight.shoe_weight2 && weight.upper_weight2 ? (weight.shoe_weight2 - weight.upper_weight2 - weight.dye.stdshoe_weight) : 0,
            d3: weight.shoe_weight3 && weight.upper_weight3 ? (weight.shoe_weight3 - weight.upper_weight3 - weight.dye.stdshoe_weight) : 0,
            person: weight.created_by.username
        }
    })
    return res.status(200).json(reports)
}
