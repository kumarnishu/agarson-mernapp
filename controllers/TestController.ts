import { NextFunction, Request, Response } from 'express';
import { AgeingRemark, Collection, Sales } from '../models/SalesModel';
import { IKeyCategory } from '../interfaces/AuthorizationInterface';
import { Key, KeyCategory } from '../models/AuthorizationModel';
import { ExcelDB, ExcelDBRemark } from '../models/ExcelReportModel';
import { PartyRemark } from '../models/PartPageModel';


export class TestController {

    public async test(req: Request, res: Response, next: NextFunction) {
        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'SALESOWNER' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        await PartyRemark.deleteMany({})
        let data = await ExcelDB.find({ category: cat._id }).populate('key').sort('created_at')
        //@ts-ignore
        let parties = data.map((i) => { return i['Account Name'] })
        parties.forEach(async (party) => {
            await ExcelDBRemark.updateMany({ obj: String(party).trim().toLowerCase() }, { party: party })
        })

        let r1 = await ExcelDBRemark.find()
        let r2 = await AgeingRemark.find()
        r1.forEach(async (item) => {
            await new PartyRemark({
                remark: item.remark,
                party: item.obj,
                next_call: item.next_date ? new Date(item.next_date) : undefined,
                created_at: new Date(item.created_at),
                created_by: item.created_by,
                updated_at: new Date(item.updated_at),
                updated_by: item.updated_by
            }).save()
        })
        r2.forEach(async (item) => {
            await new PartyRemark({
                remark: item.remark,
                party: item.party,
                next_call: item.next_call ? new Date(item.next_call) : undefined,
                created_at: new Date(item.created_at),
                created_by: item.created_by,
                updated_at: new Date(item.updated_at),
                updated_by: item.updated_by
            }).save()
        })

        return res.status(200).json(parties)

    }

}
