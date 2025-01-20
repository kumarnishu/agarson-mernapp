import { NextFunction, Request, Response } from 'express';
import xlsx from "xlsx"
import { Party } from '../models/PartPageModel';

export class TestController {

    public async test(req: Request, res: Response, next: NextFunction) {
        let result: { mobile: string, party: string, city: string, state: string, customer: string, status?: string }[] = []
        let validated = true
        let statusText: string = ""
        if (req.file) {
            const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
            if (req.file.size > 100 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
            const workbook = xlsx.read(req.file.buffer);
            let workbook_sheet = workbook.SheetNames;
            let workbook_response: { mobile: string, party: string, city: string, state: string, customer: string, status?: string }[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let mobile: string | null = item.mobile
                let customer: string | null = item.customer
                let city: string | null = item.city
                let state: string | null = item.state
                let party: string | null = item.party

                if (!party) {
                    validated = false
                    statusText = "required date"
                }
                if (validated) {
                    await new Party({
                        mobile: mobile,
                        city: city,
                        state: state,
                        customer: customer,
                        party: party,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    }).save()
                    statusText = "created"
                }
                result.push({
                    ...item,
                    status: statusText
                })
            }
        }
        return res.status(200).json('success')

    }

}
