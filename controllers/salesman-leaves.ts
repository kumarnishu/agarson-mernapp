import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { SalesmanLeaves, SalesmanLeavesColumns } from "../models/salesman-leaves";
import { IColumnRowData, IRowData } from "../dtos";

export const GetSalesmanLeavesReport = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let result: IColumnRowData = {
        columns: [],
        rows: []
    };
    let count = 0
    let rawdata: any[] = []
    if (req.user.is_admin) {
        rawdata = await SalesmanLeaves.find().sort('-created_at')
        count = await SalesmanLeaves.find().countDocuments()
    }
    else {
        rawdata = await SalesmanLeaves.find({ 'EMPLOYEE': req.user.username })
        count = await SalesmanLeaves.find({ 'EMPLOYEE': req.user.username }).countDocuments()
    }
    let columns = await SalesmanLeavesColumns.find()
    for (let k = 0; k < columns.length; k++) {
        let c = columns[k]
        result.columns.push({ key: c.name, header: c.name, type: c.type })
    }
    for (let k = 0; k < rawdata.length; k++) {
        let obj: IRowData = {}
        let dt = rawdata[k]
        if (dt) {
            for (let i = 0; i < columns.length; i++) {
                if (dt[columns[i].name]) {
                    obj[columns[i].name] = dt[columns[i].name]
                }
                else {
                    if (columns[i].type == "number")
                        obj[columns[i].name] = 0
                    else
                        obj[columns[i].name] = ""
                    result
                }
            }
        }
        result.rows.push(obj)
    }

    return res.status(200).json({
        result,
        total: Math.ceil(count / limit),
        page: page,
        limit: limit
    })
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
            await new SalesmanLeavesColumns({ name: keys[i],type:"" }).save()
        } 

        for (let i = 0; i < workbook_response.length; i++) {
            let checklist = workbook_response[i]
            await new SalesmanLeaves(checklist).save()
        }
    }
    return res.status(200).json({ message: "success" });
}