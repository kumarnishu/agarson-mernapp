import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';

import moment from "moment";
import { GetDyeStatusReportDto } from "../dtos/dye.dto";
import { ShoeWeight } from "../models/shoe-weight.model";
import { SpareDye } from "../models/spare-dye.model";

export const GetDyeStatusReport = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let reports: GetDyeStatusReportDto[] = [];

    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)

    let sparedyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('created_by').populate('location').sort('-created_at')

    let weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at")

    for (let i = 0; i < sparedyes.length; i++) {
        let dye = sparedyes[i];
        if (dye) {
            reports.push({
                _id: dye._id,
                dye: dye.dye.dye_number,
                article: "",
                size: dye.dye.size,
                std_weight: dye.dye.stdshoe_weight,
                location: dye.location.name,
                repair_required: dye.repair_required ? "Need repair" : "no Need",
                remarks: dye.remarks,
                created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                created_by: { id: dye.created_by._id,  label: dye.created_by.username }
            })
        }
    }
    for (let i = 0; i < weights.length; i++) {
        let dye = weights[i];
        if (dye) {
            reports.push({
                _id: dye._id,
                dye: dye.dye.dye_number,
                article: dye.article.name || "",
                size: dye.dye.size,
                std_weight: dye.dye.stdshoe_weight,
                location: dye.machine.name || "",
                repair_required: "",
                remarks: "",
                created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                created_by: { id: dye.created_by._id,  label: dye.created_by.username }
            })
        }
    }

    return res.status(200).json(reports)
}