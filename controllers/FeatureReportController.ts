import { NextFunction, Request, Response, Router } from 'express';
import express from 'express'
import { decimalToTimeForXlsx, hundredDaysAgo } from '../utils/datesHelper';
import moment from 'moment';
import { GetActivitiesOrRemindersDto } from '../dtos/crm-remarks.dto';
import { GetLeadDto } from '../dtos/lead.dto';
import { GetReferDto } from '../dtos/refer.dto';
import { Remark, IRemark } from '../models/crm-remarks.model';
import Lead, { ILead } from '../models/lead.model';
import { IReferredParty, ReferredParty } from '../models/refer.model';
import { GetDyeStatusReportDto } from '../dtos/dye.dto';
import { GetCategoryWiseProductionReportDto } from '../dtos/production.dto';
import { GetShoeWeightDiffReportDto } from '../dtos/shoe-weight.dto';
import { IColumnRowData, IRowData } from '../dtos/table.dto';
import { GetVisitReportDto } from '../dtos/visit-report.dto';
import { Machine } from '../models/machine.model';
import { Production } from '../models/production.model';
import { ShoeWeight, IShoeWeight } from '../models/shoe-weight.model';
import { SpareDye } from '../models/spare-dye.model';
import { User } from '../models/user.model';
import { VisitReport } from '../models/visit-report.model';

export class FeatureReportController {
     public router: Router
        constructor() {
            this.router = express.Router();
            this.generateRoutes(); // Automatically generate routes
        }
    public async GetDyeStatusReport(req: Request, res: Response, next: NextFunction) {
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
                    created_by: { id: dye.created_by._id, label: dye.created_by.username }
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
                    created_by: { id: dye.created_by._id, label: dye.created_by.username }
                })
            }
        }

        return res.status(200).json(reports)
    }
    public async GetNewRefers(req: Request, res: Response, next: NextFunction) {
        let result: GetReferDto[] = [];
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        let parties: IReferredParty[] = []

        parties = await ReferredParty.find({ created_at: { $gte: dt1, $lt: dt2 }, convertedfromlead: true }).populate('created_by').populate('updated_by').sort('-created_at');

        result = parties.map((r) => {
            return {
                _id: r._id,
                name: r.name,
                refers: r.refers,
                last_remark: r.last_remark || "",
                customer_name: r.customer_name,
                mobile: r.mobile,
                mobile2: r.mobile2,
                mobile3: r.mobile3,
                uploaded_bills: r.uploaded_bills,
                address: r.address,
                gst: r.gst,
                city: r.city,
                state: r.state,
                convertedfromlead: r.convertedfromlead,
                created_at: moment(r.created_at).format("DD/MM/YYYY"),
                updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
            }
        })
        return res.status(200).json(result)
    }

    public async GetAssignedRefers(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let dt1 = new Date(String(start_date))
        let dt2 = new Date(String(end_date))
        let result: GetLeadDto[] = []
        let leads: ILead[] = []

        leads = await Lead.find({ referred_date: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').populate('referred_party').sort('-referred_date')
        result = leads.map((lead) => {
            return {
                _id: lead._id,
                name: lead.name,
                customer_name: lead.customer_name,
                customer_designation: lead.customer_designation,
                mobile: lead.mobile,
                gst: lead.gst,
                uploaded_bills: lead.uploaded_bills,
                has_card: lead.has_card,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                country: lead.country,
                address: lead.address,
                work_description: lead.work_description,
                turnover: lead.turnover,
                alternate_mobile1: lead.alternate_mobile1,
                alternate_mobile2: lead.alternate_mobile2,
                alternate_email: lead.alternate_email,
                lead_type: lead.lead_type,
                stage: lead.stage,
                lead_source: lead.lead_source,
                visiting_card: lead.visiting_card?.public_url || "",
                referred_party_name: lead.referred_party && lead.referred_party.name,
                referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                last_remark: lead.last_remark || "",
                created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
            }
        })
        return res.status(200).json(result)
    }

    public async GetMyReminders(req: Request, res: Response, next: NextFunction) {
        let previous_date = new Date()
        let day = previous_date.getDate() - 100
        previous_date.setDate(day)
        let remarks = await Remark.find({ created_at: { $gte: previous_date, $lte: new Date() } }).populate('created_by').populate('updated_by').populate({
            path: 'lead',
            populate: [
                {
                    path: 'created_by',
                    model: 'User'
                },
                {
                    path: 'updated_by',
                    model: 'User'
                },
                {
                    path: 'referred_party',
                    model: 'ReferredParty'
                }
            ]
        }).sort('-created_at')
        let result: GetActivitiesOrRemindersDto[] = []
        let ids: string[] = []
        let filteredRemarks: IRemark[] = []

        for (let i = 0; i < remarks.length; i++) {
            let rem = remarks[i]
            if (rem && rem.lead && !ids.includes(rem.lead._id)) {
                ids.push(rem.lead._id);
                if (rem.created_by._id.valueOf() == req.user?._id && rem.remind_date && rem.remind_date >= hundredDaysAgo && rem.remind_date < new Date())
                    filteredRemarks.push(rem);
            }
        }
        filteredRemarks.sort(function (a, b) {
            //@ts-ignore
            return new Date(b.remind_date) - new Date(a.remind_date);
        });

        result = filteredRemarks.map((rem) => {
            return {
                _id: rem._id,
                remark: rem.remark,
                created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
                remind_date: rem.remind_date && moment(rem.remind_date).format("DD/MM/YYYY"),
                created_by: { id: rem.created_by._id, value: rem.created_by.username, label: rem.created_by.username },
                lead_id: rem.lead && rem.lead._id,
                name: rem.lead && rem.lead.name,
                customer_name: rem.lead && rem.lead.customer_name,
                customer_designation: rem.lead && rem.lead.customer_designation,
                mobile: rem.lead && rem.lead.mobile,
                gst: rem.lead && rem.lead.gst,
                has_card: rem.lead && rem.lead.has_card,
                email: rem.lead && rem.lead.email,
                city: rem.lead && rem.lead.city,
                state: rem.lead && rem.lead.state,
                country: rem.lead && rem.lead.country,
                address: rem.lead && rem.lead.address,
                work_description: rem.lead && rem.lead.work_description,
                turnover: rem.lead && rem.lead.turnover,
                alternate_mobile1: rem.lead && rem.lead.alternate_mobile1,
                alternate_mobile2: rem.lead && rem.lead.alternate_mobile2,
                alternate_email: rem.lead && rem.lead.alternate_email,
                lead_type: rem.lead && rem.lead.lead_type,
                stage: rem.lead && rem.lead.stage,
                lead_source: rem.lead && rem.lead.lead_source,
                visiting_card: rem.lead && rem.lead.visiting_card?.public_url || "",
                referred_party_name: rem.lead && rem.lead.referred_party?.name || "",
                referred_party_mobile: rem.lead && rem.lead.referred_party?.mobile || "",
                referred_date: rem.lead && rem.lead.referred_date && moment(rem.lead && rem.lead.referred_date).format("DD/MM/YYYY") || "",
            }
        })


        return res.status(200).json(result)
    }


    public async GetThekedarWiseProductionReports(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let production: IColumnRowData = {
            columns: [],
            rows: []
        };
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        const oneDay = 24 * 60 * 60 * 1000;
        let users = await User.find().sort("username")
        //columns
        production.columns.push({ key: 'date', header: 'Date', type: 'date' });
        users = users.filter((u) => { return u.assigned_permissions.includes('production_view') })
        for (let k = 0; k < users.length; k++) {
            let user = users[k]
            production.columns.push({ key: user.username, header: String(user.username).toUpperCase(), type: 'number' })
        }
        production.columns.push({ key: 'total', header: 'Total', type: 'number' });
        while (dt1 <= dt2) {
            //rows
            let total = 0
            let obj: IRowData = {}
            obj['date'] = moment(dt1).format("DD/MM/YYYY")
            for (let k = 0; k < users.length; k++) {
                let user = users[k]
                let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) }, thekedar: user._id })
                let result = data.reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
                if (result === 0)
                    obj[users[k].username] = result;
                else
                    obj[users[k].username] = result;
                total += result
            }
            obj['total'] = total
            production.rows.push(obj);
            dt1 = new Date(dt1.getTime() + oneDay);
        }


        return res.status(200).json(production)
    }

    public async GetMachineWiseProductionReports(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let production: IColumnRowData = {
            columns: [],
            rows: []
        };
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        const oneDay = 24 * 60 * 60 * 1000;
        let machines = await Machine.find({ active: true }).sort('serial_no')
        //columns
        production.columns.push({ key: 'date', header: 'Date', type: 'date' });
        for (let k = 0; k < machines.length; k++) {
            production.columns.push({ key: machines[k].name, header: String(machines[k].display_name).toUpperCase(), type: 'number' })
        }
        production.columns.push({ key: 'total', header: 'Total', type: 'number' });

        //rows
        while (dt1 <= dt2) {
            let total = 0
            let obj: IRowData = {}
            obj['date'] = moment(dt1).format("DD/MM/YYYY")
            for (let k = 0; k < machines.length; k++) {
                let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) }, machine: machines[k]._id })
                let result = data.reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
                if (result === 0)
                    obj[machines[k].name] = result;
                else
                    obj[machines[k].name] = result;
                total += result
            }
            obj['total'] = total
            production.rows.push(obj);
            dt1 = new Date(dt1.getTime() + oneDay);
        }

        return res.status(200).json(production)
    }


    public async GetCategoryWiseProductionReports(req: Request, res: Response, next: NextFunction) {
        let start_date = req.query.start_date
        let end_date = req.query.end_date
        let productions: GetCategoryWiseProductionReportDto[] = [];
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)
        const oneDay = 24 * 60 * 60 * 1000;

        while (dt1 <= dt2) {

            let data = await Production.find({ date: { $gte: dt1, $lt: new Date(dt1.getTime() + oneDay) } }).populate('machine')

            let verpluslymphaprod = data.filter((prod) => { return prod.machine.category === "vertical" || prod.machine.category === "lympha" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)

            let puprod = data.filter((prod) => { return prod.machine.category === "pu" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
            let gumbootprod = data.filter((prod) => { return prod.machine.category === "gumboot" }).reduce((a, b) => { return Number(a) + Number(b.production) }, 0)
            let total = verpluslymphaprod + puprod + gumbootprod;
            productions.push({
                date: moment(dt1).format("DD/MM/YYYY"),
                total: total,
                verticalpluslympha: verpluslymphaprod,
                pu: puprod,
                gumboot: gumbootprod
            })
            dt1 = new Date(dt1.getTime() + oneDay);
        }
        return res.status(200).json(productions)
    }

    public async GetShoeWeightDifferenceReports(req: Request, res: Response, next: NextFunction) {
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
    public async GetVisitReports(req: Request, res: Response, next: NextFunction) {
        let employee = req.query.employee
        if (!employee)
            return res.status(400).json({ message: "please select employee" })
        let reports: GetVisitReportDto[] = (await VisitReport.find({ employee: employee }).populate('employee').populate('created_by').populate('updated_by').sort('-visit_date')).map((i) => {
            return {
                _id: i._id,
                employee: i.employee.username,
                visit_date: moment(i.visit_date).format("DD/MM/YYYY"),
                customer: i.customer,
                intime: decimalToTimeForXlsx(i.intime),
                outtime: decimalToTimeForXlsx(i.outtime),
                visitInLocation: i.visitInLocation,
                visitOutLocation: i.visitOutLocation,
                remarks: i.remarks,
                created_by: i.created_by.username,
                updated_by: i.updated_by.username,
                created_at: moment(i.created_at).format("DD/MM/YYYY"),
                updated_at: moment(i.updated_at).format("DD/MM/YYYY")
            }
        })
        return res.status(200).json(reports);
    }
    private generateRoutes(): void {
        const methodPrefix = ['get', 'post', 'put', 'patch', 'delete']; // Allowed HTTP methods

        Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter((methodName) => methodName !== 'constructor' && typeof (this as any)[methodName] === 'function')
            .forEach((methodName) => {
                const match = methodName.match(new RegExp(`^(${methodPrefix.join('|')})([A-Z].*)$`));
                if (match) {
                    const [, httpMethod, routeName] = match;
                    const routePath =
                        '/' +
                        routeName
                            .replace(/([A-Z])/g, '-$1')
                            .toLowerCase()
                            .substring(1); // Convert "CamelCase" to "kebab-case"
                    //@ts-ignore
                    this.router[httpMethod](routePath, (this as any)[methodName].bind(this));
                }
            });
    }
}