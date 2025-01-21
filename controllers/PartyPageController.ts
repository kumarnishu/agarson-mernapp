import { NextFunction, Request, Response } from 'express';
import { decimalToTimeForXlsx } from "../utils/datesHelper";
import moment from "moment";
import { IColumnRowData, IRowData } from "../dtos/SalesDto";
import { ICRMState, IKeyCategory } from "../interfaces/AuthorizationInterface";
import { KeyCategory, Key } from "../models/AuthorizationModel";
import { ExcelDB } from "../models/ExcelReportModel";
import { CreateOrEditPartyRemarkDto, CreateOrEditSampleSystemDto, GetPartyAgeingDto, GetPartyRemarkDto, GetSampleSystemDto, PartyListDto } from "../dtos/PartyPageDto";
import { Ageing } from '../models/SalesModel';
import { IAgeing } from '../interfaces/SalesInterface';
import isMongoId from 'validator/lib/isMongoId';
import { Party, PartyRemark, SampleSystem } from '../models/PartPageModel';
import { IPartyRemark, ISampleSystem } from '../interfaces/PartyPageInterface';
import { User } from '../models/UserModel';
import { SampleSystemRemark } from '../models/RemarksModel';


export class PartyPageController {

    public async GetPartyMobile(req: Request, res: Response, next: NextFunction) {
        let party = req.query.party
        if (!party) {
            return res.status(400).json({ message: 'Provide party name' })
        }
        let item = await Party.findOne({ party: party })
        if (!item)
            return res.status(404).json({ message: 'party not exists' })
        let mobile = item.mobile || "Mobile not available"
        return res.status(200).json(mobile)
    }
    public async GetALlPartiesWithState(req: Request, res: Response, next: NextFunction) {
        let result: PartyListDto[] = []
        let assigned_states: string[] = []
        let user = await User.findById(req.user._id).populate('assigned_crm_states')
        user && user?.assigned_crm_states.map((state: ICRMState) => {
            assigned_states.push(state.state)
            if (state.alias1)
                assigned_states.push(state.alias1)
            if (state.alias2)
                assigned_states.push(state.alias2)
        });
        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'BillsAge' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        let keys = await Key.find({ category: cat._id }).sort('serial_no');

        let data = []
        if (req.user.is_admin) {
            data = await ExcelDB.find({
                category: cat._id
            }).populate('key').sort('created_at')
        }
        else
            data = await ExcelDB.find({
                category: cat._id, 'Sales Representative': {
                    $in: assigned_states.map(state => new RegExp(`^${state.trim()}$`, 'i')) // Case-insensitive and trimmed regex
                }
            }).populate('key').sort('created_at')

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

        let rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        result = rows.map((r) => { return { party: r['Account Name'], state: r["Sales Representative"] } })
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
        // for (let k = 0; k < keys.length; k++) {
        //     let c = keys[k]
        //     result.columns.push({ key: c.key, header: c.key, type: c.type })
        // }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            if (c.type !== 'number')
                result.columns.push({ key: c.key, header: c.key, type: c.type })
            else {
                const data: { key: string, value: number }[] = result.rows.map((dt) => { return { key: c.key, value: dt[c.key] } })
                const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
                console.log(c.key, total)
                if (total > 0)
                    result.columns.push({ key: c.key, header: c.key, type: c.type })
            }

        }
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
        // for (let k = 0; k < keys.length; k++) {
        //     let c = keys[k]
        //     result.columns.push({ key: c.key, header: c.key, type: c.type })
        // }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            if (c.type !== 'number')
                result.columns.push({ key: c.key, header: c.key, type: c.type })
            else {
                const data: { key: string, value: number }[] = result.rows.map((dt) => { return { key: c.key, value: dt[c.key] } })
                const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
                console.log(c.key, total)
                if (total > 0)
                    result.columns.push({ key: c.key, header: c.key, type: c.type })
            }

        }
        return res.status(200).json(result)
    }
    public async GetStockSellerParties(req: Request, res: Response, next: NextFunction) {
        let result: IColumnRowData = {
            columns: [],
            rows: []
        };
        let assigned_states: string[] = []
        let cat: IKeyCategory | null = await KeyCategory.findOne({ category: 'ClientSale' })
        if (!cat)
            return res.status(404).json({ message: `${cat} not exists` })
        let keys = await Key.find({ category: cat._id }).sort('serial_no');
        let user = await User.findById(req.user._id).populate('assigned_crm_states')
        user && user?.assigned_crm_states.map((state: ICRMState) => {
            //@ts-ignore
            assigned_states.push(new RegExp(`^${state.state}$`, 'i'))
            if (state.alias1)
                //@ts-ignore
                assigned_states.push(new RegExp(`^${state.alias1}$`, 'i'))
            if (state.alias2)
                //@ts-ignore
                assigned_states.push(new RegExp(`^${state.alias2}$`, 'i'))
        });
        let data = await ExcelDB.find({ category: cat._id, 'STATE NAME': { $in: assigned_states } }).populate('key').sort('created_at')

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
        // for (let k = 0; k < keys.length; k++) {
        //     let c = keys[k]
        //     result.columns.push({ key: c.key, header: c.key, type: c.type })
        // }
        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]
        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            if (c.type !== 'number')
                result.columns.push({ key: c.key, header: c.key, type: c.type })
            else {
                const data: { key: string, value: number }[] = result.rows.map((dt) => { return { key: c.key, value: dt[c.key] } })
                const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
                console.log(c.key, total)
                if (total > 0)
                    result.columns.push({ key: c.key, header: c.key, type: c.type })
            }

        }
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
        let promiseResult = await Promise.all(data.map(async (_dt) => {
            let obj: IRowData = {}
            let dt = _dt
            if (dt) {
                keys.forEach((item) => {
                    let key = item.key
                    let type = item.type
                    //@ts-ignore
                    if (dt[key]) {
                        if (type == "timestamp")
                            //@ts-ignore
                            obj[key] = String(decimalToTimeForXlsx(dt[key]))
                        else if (type == "date") {
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
                        if (type == "number")
                            obj[key] = 0
                        else
                            obj[key] = ""
                    }

                })
            }
            if (dt)
                return obj
        }))
        // for (let k = 0; k < keys.length; k++) {
        //     let c = keys[k]
        //     result.columns.push({ key: c.key, header: c.key, type: c.type })
        // }

        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]

        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            if (c.type !== 'number')
                result.columns.push({ key: c.key, header: c.key, type: c.type })
            else {
                const data: { key: string, value: number }[] = result.rows.map((dt) => { return { key: c.key, value: dt[c.key] } })
                const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
                console.log(c.key, total)
                if (total > 0)
                    result.columns.push({ key: c.key, header: c.key, type: c.type })
            }

        }
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

        result.rows = promiseResult.filter(row => {
            if (row)
                return row
        }) as IRowData[]

        for (let k = 0; k < keys.length; k++) {
            let c = keys[k]
            if (c.type !== 'number')
                result.columns.push({ key: c.key, header: c.key, type: c.type })
            else {
                const data: { key: string, value: number }[] = result.rows.map((dt) => { return { key: c.key, value: dt[c.key] } })
                const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
                console.log(c.key, total)
                if (total > 0)
                    result.columns.push({ key: c.key, header: c.key, type: c.type })
            }

        }

        return res.status(200).json(result)
    }

    public async NewPartyRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, party, nextcall } = req.body as CreateOrEditPartyRemarkDto
        if (!remark || !party) return res.status(403).json({ message: "please fill required fields" })

        await new PartyRemark({
            remark,
            party,
            next_call: nextcall ? new Date(nextcall) : undefined,
            created_at: new Date(Date.now()),
            created_by: req.user,
            updated_at: new Date(Date.now()),
            updated_by: req.user
        }).save()
        return res.status(200).json({ message: "remark added successfully" })
    }
    public async UpdatePartyRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, nextcall } = req.body as CreateOrEditPartyRemarkDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await PartyRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        rremark.remark = remark
        if (nextcall)
            rremark.next_call = new Date(nextcall)
        await rremark.save()
        return res.status(200).json({ message: "remark updated successfully" })
    }

    public async DeletePartyRemark(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await PartyRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        await rremark.remove()
        return res.status(200).json({ message: " remark deleted successfully" })
    }

    public async GetPartyLast5Remarks(req: Request, res: Response, next: NextFunction) {
        const party = req.query.party;
        if (!party) return res.status(403).json({ message: "please fill required fields" })
        let remarks: IPartyRemark[] = []

        let result: GetPartyRemarkDto[] = []
        remarks = await PartyRemark.find({ party: party }).populate('created_by').sort('-created_at').limit(5)
        result = remarks.map((r) => {
            return {
                _id: r._id,
                remark: r.remark,
                party: r.party,
                nextcall: r.next_call ? r.next_call.toString() : "",
                created_at: r.created_at.toString(),
                created_by: { id: r.created_by._id, label: r.created_by.username }
            }
        })
        return res.json(result)
    }

    public async GetSampleSytems(req: Request, res: Response, next: NextFunction) {
        let attendances: ISampleSystem[] = []
        let result: GetSampleSystemDto[] = []
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let hidden = req.query.hidden
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        let dt11 = new Date()
        dt11.setDate(dt11.getDate() + 1)
        dt11.setHours(0, 0, 0, 0)
        attendances = await SampleSystem.find({ date: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').sort('-date')
        if (hidden && hidden !== 'true') {
            attendances = attendances.filter((A) => { return !A.next_call || A.next_call < dt11 })
        }

        result = attendances.map((p) => {
            return {
                _id: p._id,
                party: p.party,
                otherparty: p.otherparty,
                state: p.state,
                stage: p.stage,
                last_remark: p.last_remark,
                next_call: p.next_call && moment(p.next_call).format("DD/MM/YYYY"),
                samples: p.samples,
                date: p.date && moment(p.date).format("DD/MM/YYYY"),
                created_at: p.created_at.toString(),
                updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
                created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
                updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }
    public async CreateSampleSystem(req: Request, res: Response, next: NextFunction) {
        let {
            date,
            party,
            samples,
            otherparty,
            stage,
            state,

        } = req.body as CreateOrEditSampleSystemDto

        if (!party || !date || !state || !samples || !stage)
            return res.status(400).json({ message: "please fill all reqired fields" })

        let prevatt = await SampleSystem.findOne({ party: party, state: state, samples: samples, date: new Date(date) })
        if (prevatt)
            return res.status(500).json({ message: 'sample exists already for the same date' })
        let att = await new SampleSystem({
            date: new Date(date),
            party,
            samples,
            otherparty,
            stage,
            state,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()

        return res.status(201).json(att)
    }
    public async UpdateSampleSystem(req: Request, res: Response, next: NextFunction) {
        let {
            party,
            date,
            samples,
            otherparty,
            stage,
            state,

        } = req.body as CreateOrEditSampleSystemDto

        if (!party || !date || !state || !samples || !stage)
            return res.status(400).json({ message: "please fill all reqired fields" })


        const id = req.params.id
        if (!isMongoId(id))
            return res.status(400).json({ message: "not a valid request" })
        let sample = await SampleSystem.findById(id)


        if (!sample)
            return res.status(404).json({ message: "attendance not exists" })

        await SampleSystem.findByIdAndUpdate(sample._id,
            {
                party,
                date: new Date(date),
                samples,
                stage,
                otherparty,
                state,
                updated_at: new Date(),
                updated_by: req.user
            })
        return res.status(200).json({ message: "sample updated" })
    }
    public async DeleteSampleSystem(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!id)
            return res.status(400).json({ message: "not a valid request" })
        let sample = await SampleSystem.findById(id)
        if (!sample)
            return res.status(404).json({ message: "sample not exists" })

        await SampleSystem.findByIdAndDelete(sample._id)
        await SampleSystemRemark.deleteMany({ sample: id })
        return res.status(200).json({ message: "sample system removed" })
    }
}