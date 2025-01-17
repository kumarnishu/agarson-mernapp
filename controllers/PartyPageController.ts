import { NextFunction, Request, Response } from 'express';
import { decimalToTimeForXlsx } from "../utils/datesHelper";
import moment from "moment";
import { IColumnRowData, IRowData } from "../dtos/SalesDto";
import { IKeyCategory } from "../interfaces/AuthorizationInterface";
import { KeyCategory, Key } from "../models/AuthorizationModel";
import { ExcelDB } from "../models/ExcelReportModel";
import { GetPartyAgeingDto, GetPartyRemarkDto } from "../dtos/PartyPageDto";
import { Ageing } from '../models/SalesModel';
import { IAgeing } from '../interfaces/SalesInterface';


export class PartyPageController {
    public async GetPartyLast5Remarks(req: Request, res: Response, next: NextFunction) {
        let party = String(req.query.party).toLowerCase()
        let result: GetPartyRemarkDto[] = [
            {
                "_id": "1",
                "remark": "Followed up with the client, awaiting feedback.",
                "remark_type": "Follow-up",
                "party": "ABC Corp",
                "nextcall": "2025-01-20T10:00:00Z",
                "created_at": "2025-01-15T14:30:00Z",
                "created_by": { "id": "101", "label": "John Doe" }
            },
            {
                "_id": "2",
                "remark": "Discussed contract terms, revisions needed.",
                "remark_type": "Contract Discussion",
                "party": "XYZ Ltd",
                "nextcall": "2025-01-22T15:00:00Z",
                "created_at": "2025-01-16T09:45:00Z",
                "created_by": { "id": "102", "label": "Jane Smith" }
            },
            {
                "_id": "3",
                "remark": "Sent proposal, awaiting approval.",
                "remark_type": "Proposal Sent",
                "party": "PQR Industries",
                "nextcall": "2025-01-21T11:30:00Z",
                "created_at": "2025-01-17T08:15:00Z",
                "created_by": { "id": "103", "label": "Emily Johnson" }
            },
            {
                "_id": "4",
                "remark": "Client raised concerns about pricing.",
                "remark_type": "Pricing Discussion",
                "party": "LMN Inc",
                "nextcall": "2025-01-25T14:00:00Z",
                "created_at": "2025-01-16T12:00:00Z",
                "created_by": { "id": "104", "label": "Michael Brown" }
            },
            {
                "_id": "5",
                "remark": "Completed onboarding process successfully.",
                "remark_type": "Onboarding",
                "party": "DEF Partners",
                "nextcall": "2025-01-30T10:00:00Z",
                "created_at": "2025-01-15T13:45:00Z",
                "created_by": { "id": "105", "label": "Sophia Davis" }
            }
        ]


        return res.status(200).json(result)
    }
    public async GetPartyAgeing1(req: Request, res: Response, next: NextFunction) {
        let result: GetPartyAgeingDto[] = []
        let party = req.query.party
        let data: IAgeing[] = await Ageing.find({ party: party }).sort('-created_at');
        result = data.map((dt) => {
            return {
                _id: dt._id,
                party: dt.party,
                state: dt.state,
                two5: dt.two5,
                three0: dt.three0,
                five5: dt.five5,
                six0: dt.six0,
                seven0: dt.seven0,
                seventyplus: dt.seventyplus,
            }
        })
        return res.status(200).json(result)
    }

    public async GetPartyAgeingReport2(req: Request, res: Response, next: NextFunction) {
        let party = req.query.party
        let result: IColumnRowData = {
            columns: [],
            rows: []
        };

        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'BillsAge' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        let keys = await Key.find({ category: cat._id }).sort('serial_no');

        let data = await ExcelDB.find({ category: cat._id, 'Account Name': party }).populate('key').sort('created_at')

        let promiseResult = await Promise.all(data.map(async (_dt) => {
            let obj: IRowData = {}
            let dt = _dt
            if (dt) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i].key
                    //@ts-ignore
                    if (dt[key]) {
                        if (keys[i].type == "timestamp")
                            //@ts-ignore
                            obj[key] = String(decimalToTimeForXlsx(dt[key]))
                        else if (keys[i].type == "date") {
                            if (cat && cat.category == 'SalesRep' && key == 'Sales Representative') {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("MMM-YY")
                            }
                            else {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("YYYY-MM-DD")
                            }
                        }
                        else
                            //@ts-ignore
                            obj[key] = dt[key]


                    }
                    else {
                        if (keys[i].type == "number")
                            obj[key] = 0
                        else
                            obj[key] = ""
                    }

                }
            }
            if (dt)
                return obj
        }))
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            result.columns.push({ key: c.key, header: c.key, type: c.type })
        }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        return res.status(200).json(result)
    }

    public async GetPartyForcastAndGrowth(req: Request, res: Response, next: NextFunction) {
        let result: IColumnRowData = {
            columns: [],
            rows: []
        };
        let party = req.query.party
        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'PartyTarget' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        let keys = await Key.find({ category: cat._id }).sort('serial_no');

        let data = await ExcelDB.find({ category: cat._id, 'PARTY': party }).populate('key').sort('created_at')

        let promiseResult = await Promise.all(data.map(async (_dt) => {
            let obj: IRowData = {}
            let dt = _dt
            if (dt) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i].key
                    //@ts-ignore
                    if (dt[key]) {
                        if (keys[i].type == "timestamp")
                            //@ts-ignore
                            obj[key] = String(decimalToTimeForXlsx(dt[key]))
                        else if (keys[i].type == "date") {
                            if (cat && cat.category == 'SalesRep' && key == 'Sales Representative') {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("MMM-YY")
                            }
                            else {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("YYYY-MM-DD")
                            }
                        }
                        else
                            //@ts-ignore
                            obj[key] = dt[key]


                    }
                    else {
                        if (keys[i].type == "number")
                            obj[key] = 0
                        else
                            obj[key] = ""
                    }

                }
            }
            if (dt)
                return obj
        }))
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            result.columns.push({ key: c.key, header: c.key, type: c.type })
        }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        return res.status(200).json(result)
    }
    public async GetPartyArticleSaleMonthly(req: Request, res: Response, next: NextFunction) {
        let result: IColumnRowData = {
            columns: [],
            rows: []
        };
        let party = req.query.party

        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'ClientSale' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        let keys = await Key.find({ category: cat._id }).sort('serial_no');

        let data = await ExcelDB.find({ category: cat._id, 'CUSTOMER': party }).populate('key').sort('created_at')

        let promiseResult = await Promise.all(data.map(async (_dt) => {
            let obj: IRowData = {}
            let dt = _dt
            if (dt) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i].key
                    //@ts-ignore
                    if (dt[key]) {
                        if (keys[i].type == "timestamp")
                            //@ts-ignore
                            obj[key] = String(decimalToTimeForXlsx(dt[key]))
                        else if (keys[i].type == "date") {
                            if (cat && cat.category == 'SalesRep' && key == 'Sales Representative') {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("MMM-YY")
                            }
                            else {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("YYYY-MM-DD")
                            }
                        }
                        else
                            //@ts-ignore
                            obj[key] = dt[key]


                    }
                    else {
                        if (keys[i].type == "number")
                            obj[key] = 0
                        else
                            obj[key] = ""
                    }

                }
            }
            if (dt)
                return obj
        }))
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            result.columns.push({ key: c.key, header: c.key, type: c.type })
        }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        return res.status(200).json(result)
    }
    public async GetPartyPendingOrders(req: Request, res: Response, next: NextFunction) {
        let result: IColumnRowData = {
            columns: [],
            rows: []
        };
        let party = req.query.party
        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'SALESOWNER' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        let keys = await Key.find({ category: cat._id }).sort('serial_no');

        let data = await ExcelDB.find({ category: cat._id, 'Account Name': party }).populate('key').sort('created_at')
        console.log(cat._id,party,data.length)
        let promiseResult = await Promise.all(data.map(async (_dt) => {
            let obj: IRowData = {}
            let dt = _dt
            if (dt) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i].key
                    //@ts-ignore
                    if (dt[key]) {
                        if (keys[i].type == "timestamp")
                            //@ts-ignore
                            obj[key] = String(decimalToTimeForXlsx(dt[key]))
                        else if (keys[i].type == "date") {
                            if (cat && cat.category == 'SalesRep' && key == 'Sales Representative') {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("MMM-YY")
                            }
                            else {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("YYYY-MM-DD")
                            }
                        }
                        else
                            //@ts-ignore
                            obj[key] = dt[key]


                    }
                    else {
                        if (keys[i].type == "number")
                            obj[key] = 0
                        else
                            obj[key] = ""
                    }

                }
            }
            if (dt)
                return obj
        }))
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            result.columns.push({ key: c.key, header: c.key, type: c.type })
        }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        return res.status(200).json(result)
    }
    public async GetCurrentStock(req: Request, res: Response, next: NextFunction) {
        let result: IColumnRowData = {
            columns: [],
            rows: []
        };

        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'ArticleCurStk' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        let keys = await Key.find({ category: cat._id }).sort('serial_no');

        let data = await ExcelDB.find({ category: cat._id }).populate('key').sort('created_at')

        let promiseResult = await Promise.all(data.map(async (_dt) => {
            let obj: IRowData = {}
            let dt = _dt
            if (dt) {
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i].key
                    //@ts-ignore
                    if (dt[key]) {
                        if (keys[i].type == "timestamp")
                            //@ts-ignore
                            obj[key] = String(decimalToTimeForXlsx(dt[key]))
                        else if (keys[i].type == "date") {
                            if (cat && cat.category == 'SalesRep' && key == 'Sales Representative') {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("MMM-YY")
                            }
                            else {
                                //@ts-ignore
                                obj[key] = moment(dt[key]).format("YYYY-MM-DD")
                            }
                        }
                        else
                            //@ts-ignore
                            obj[key] = dt[key]


                    }
                    else {
                        if (keys[i].type == "number")
                            obj[key] = 0
                        else
                            obj[key] = ""
                    }

                }
            }
            if (dt)
                return obj
        }))
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            result.columns.push({ key: c.key, header: c.key, type: c.type })
        }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        return res.status(200).json(result)
    }

    // public async UpdateExcelDBRemark(req: Request, res: Response, next: NextFunction) {
    //     const { remark, next_date } = req.body as CreateOrEditExcelDbRemarkDto
    //     if (!remark) return res.status(403).json({ message: "please fill required fields" })

    //     const id = req.params.id;
    //     if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    //     let rremark = await ExcelDBRemark.findById(id)
    //     if (!rremark) {
    //         return res.status(404).json({ message: "remark not found" })
    //     }
    //     rremark.remark = remark
    //     if (next_date)
    //         rremark.next_date = new Date(next_date)
    //     await rremark.save()
    //     return res.status(200).json({ message: "remark updated successfully" })
    // }

    // public async DeleteExcelDBRemark(req: Request, res: Response, next: NextFunction) {
    //     const id = req.params.id;
    //     if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    //     let rremark = await ExcelDBRemark.findById(id)
    //     if (!rremark) {
    //         return res.status(404).json({ message: "remark not found" })
    //     }
    //     await rremark.remove()
    //     return res.status(200).json({ message: " remark deleted successfully" })
    // }


    // public async GetExcelDBRemarkHistory(req: Request, res: Response, next: NextFunction) {
    //     const id = req.params.id;
    //     const obj = req.query.obj
    //     let remarks: IExcelDBRemark[] = []
    //     let result: GetExcelDBRemarksDto[] = []

    //     if (!isMongoId(id)) return res.status(400).json({ message: "id not valid" })
    //     if (!obj) return res.status(404).json({ message: "obj not found" })

    //     remarks = await ExcelDBRemark.find({ category: id, obj: String(obj).trim().toLowerCase() }).populate('category').populate('created_by').sort('-created_at')

    //     result = remarks.map((r) => {
    //         return {
    //             _id: r._id,
    //             remark: r.remark,
    //             obj: r.obj,
    //             category: { id: r.category._id, value: r.category.category, label: r.category.category },
    //             next_date: r.next_date ? moment(r.next_date).format('DD/MM/YYYY') : "",
    //             created_date: r.created_at.toString(),
    //             created_by: r.created_by.username
    //         }
    //     })
    //     return res.json(result)
    // }

    // public async NewExcelDBRemark(req: Request, res: Response, next: NextFunction) {
    //     const {
    //         remark,
    //         category,
    //         obj,
    //         next_date } = req.body as CreateOrEditExcelDbRemarkDto
    //     if (!remark || !category || !obj) return res.status(403).json({ message: "please fill required fields" })

    //     let categoryObj = await KeyCategory.findById(category)
    //     if (!category) {
    //         return res.status(404).json({ message: "category not found" })
    //     }

    //     let new_remark = new ExcelDBRemark({
    //         remark,
    //         obj,
    //         category: categoryObj,
    //         created_at: new Date(Date.now()),
    //         created_by: req.user,
    //         updated_at: new Date(Date.now()),
    //         updated_by: req.user
    //     })
    //     if (next_date)
    //         new_remark.next_date = new Date(next_date)
    //     await new_remark.save()
    //     return res.status(200).json({ message: "remark added successfully" })
    // }



}