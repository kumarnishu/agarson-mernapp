import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import moment from "moment";
import { GetCategoryWiseProductionReportDto } from "../dtos/production.dto";
import { IColumnRowData, IRowData } from "../dtos/table.dto";
import { Machine } from "../models/machine.model";
import { Production } from "../models/production.model";
import { User } from "../models/user.model";

export const GetThekedarWiseProductionReports = async (req: Request, res: Response, next: NextFunction) => {
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

export const GetMachineWiseProductionReports = async (req: Request, res: Response, next: NextFunction) => {
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


export const GetCategoryWiseProductionReports = async (req: Request, res: Response, next: NextFunction) => {
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