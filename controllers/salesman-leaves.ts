import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { SalesmanLeaves, SalesmanLeavesColumns } from "../models/salesman-leaves";
import { IColumnRowData, IRowData } from "../dtos";
import { User } from "../models/user";
import ConvertJsonToExcel from "../utils/ConvertJsonToExcel";

export const GetSalesmanLeavesReport = async (req: Request, res: Response, next: NextFunction) => {
    let result: IColumnRowData = {
        columns: [],
        rows: []
    };
    let rawdata: any[] = []
    let fixedData = await SalesmanLeaves.findOne().sort('-created_at')
    if (req.user.is_admin) {
        rawdata = await SalesmanLeaves.find().sort('-created_at')
    }
    else {
        rawdata.push(fixedData)
        let data = await SalesmanLeaves.find({ 'EMPLOYEE': req.user.username })
        rawdata = rawdata.concat(data)
    }


    let columns = await SalesmanLeavesColumns.find()
    for (let k = 0; k < columns.length; k++) {
        let c = columns[k]
        result.columns.push({ key: c.name, header: c.name, type: "string" })
    }
    for (let k = 0; k < rawdata.length; k++) {
        let obj: IRowData = {}
        let dt = rawdata[k]
        if (dt) {
            for (let i = 0; i < columns.length; i++) {
                if (dt[columns[i].name]) {
                    obj[columns[i].name] = String(dt[columns[i].name])
                }
                else {
                    obj[columns[i].name] = ""
                }
            }
        }
        result.rows.push(obj)
    }

    return res.status(200).json(result)
}

export const CreateSalesmanLeavesFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: any[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        let data = workbook_response[0];
        let keys: string[] = Object.keys(data);
        console.log("keys", keys)
        await SalesmanLeaves.deleteMany({})
        await SalesmanLeavesColumns.deleteMany({})
        for (let i = 0; i < keys.length; i++) {
            await new SalesmanLeavesColumns({ name: keys[i] }).save()
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let checklist = workbook_response[i]
            await new SalesmanLeaves(checklist).save()
        }
    }
    return res.status(200).json({ message: "success" });
}

export const DownloadExcelTemplateForCreateSalesmanLeavesReport = async (req: Request, res: Response, next: NextFunction) => {
    let checklist: any[]=[
        {
            "S NO": "*",
            "EMPLOYEE LEAVE BALANCE": "*",
            "EMPLOYEE": "*"
        }
    ]
    let users = (await User.find()).map((u) => { return { name: u.username } })
    let template: { sheet_name: string, data: any[] }[] = []
    template.push({ sheet_name: 'template', data:checklist })
    template.push({ sheet_name: 'users', data: users })
    ConvertJsonToExcel(template)
    let fileName = "CreateSalesmanLeavesTemplate.xlsx"
    return res.download("./file", fileName)
}