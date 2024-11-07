import { NextFunction, Request, Response } from 'express';
import xlsx from "xlsx";
import { State } from '../models/erp-state';

export const test = async (req: Request, res: Response, next: NextFunction) => {

    let states=await State.find()
    for(let i=0;i<states.length;i++){
        let state=states[i]
        state.state=state.state.toLowerCase()
        await state.save()
    }
    // if (!req.file)
    //     return res.status(400).json({
    //         message: "please provide an Excel file",
    //     });
    // if (req.file) {
    //     const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
    //     if (!allowedFiles.includes(req.file.mimetype))
    //         return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
    //     if (req.file.size > 100 * 1024 * 1024)
    //         return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
    //     const workbook = xlsx.read(req.file.buffer);
    //     let workbook_sheet = workbook.SheetNames;
    //     let workbook_response: any[] = xlsx.utils.sheet_to_json(
    //         workbook.Sheets[workbook_sheet[0]]
    //     );
    //     console.log(workbook_response)
    //     if (workbook_response.length > 3000) {
    //         return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
    //     }
    //     let end_date = new Date();
    //     end_date.setFullYear(end_date.getFullYear() + 30)
       
    // }


    return res.status(200).json("successs");
}