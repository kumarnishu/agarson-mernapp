import { NextFunction, Request, Response } from 'express';
import { Collection, Sales } from '../models/SalesModel';
import { IKeyCategory } from '../interfaces/AuthorizationInterface';
import { Key, KeyCategory } from '../models/AuthorizationModel';
import { ExcelDB } from '../models/ExcelReportModel';


export class TestController {

    public async test(req: Request, res: Response, next: NextFunction) {
        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'SALESOWNER' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })

        let data = await ExcelDB.find({ category: cat._id }).populate('key').sort('created_at')
        //@ts-ignore
        let parties = data.map((i) => { return i['Account Name'] })
        parties.forEach(async (party) => {
            await Collection.updateMany({ party: String(party).trim().toLowerCase() }, { party: party })
        })
        return res.status(200).json(parties)

    }

}
