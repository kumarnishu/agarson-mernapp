import { NextFunction, Request, Response } from 'express';
import { IProduction, Production } from '../models/production';
import { CreateOrEditProductionDto, GetProductionDto } from '../dtos';
import { IUser, User } from '../models/user';
import moment from 'moment';
import { Machine } from '../models/machine';


export const GetProductions = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let productions: IProduction[] = []
    let result: GetProductionDto[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (!id) {
            if (user_ids.length > 0) {
                productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: { $in: user_ids } }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
                count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: { $in: user_ids } }).countDocuments()
            }

            else {
                productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: req.user?._id }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
                count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: req.user?._id }).countDocuments()
            }
        }


        if (id) {
            productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: id }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('date').skip((page - 1) * limit).limit(limit)
            count = await Production.find({ date: { $gte: dt1, $lt: dt2 }, thekedar: id }).countDocuments()
        }
        result = productions.map((p) => {
            return {
                _id: p._id,
                machine: { id: p.machine._id, value: p.machine.name, label: p.machine.name },
                thekedar: { id: p.thekedar._id, value: p.thekedar.username, label: p.thekedar.username },
                articles: p.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
                manpower: p.manpower,
                production: p.production,
                big_repair: p.big_repair,
                upper_damage: p.upper_damage,
                small_repair: p.small_repair,
                date: p.date && moment(p.date).format("DD/MM/YYYY"),
                production_hours: p.production_hours,
                created_at: p.created_at && moment(p.created_at).format("DD/MM/YYYY"),
                updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
                created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
                updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
            }
        })
        return res.status(200).json({
            result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else
        return res.status(400).json({ message: "bad request" })
}


export const GetMyTodayProductions = async (req: Request, res: Response, next: NextFunction) => {
    let machine = req.query.machine
    let date = String(req.query.date)
    let dt1 = new Date(date)
    let dt2 = new Date(date)
    dt2.setDate(dt1.getDate() + 1)
    let productions: IProduction[] = []
    let result: GetProductionDto[] = []
    if (machine) {
        productions = await Production.find({ date: { $gte: dt1, $lt: dt2 }, machine: machine }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    if (!machine)
        productions = await Production.find({ date: { $gte: dt1, $lt: dt2 } }).populate('machine').populate('thekedar').populate('articles').populate('created_by').populate('updated_by').sort('-updated_at')

    result = productions.map((p) => {
        return {
            _id: p._id,
            machine: { id: p.machine._id, value: p.machine.name, label: p.machine.name },
            thekedar: { id: p.thekedar._id, value: p.thekedar.username, label: p.thekedar.username },
            articles: p.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
            manpower: p.manpower,
            production: p.production,
            big_repair: p.big_repair,
            upper_damage: p.upper_damage,
            small_repair: p.small_repair,
            date: p.date && moment(p.date).format("DD/MM/YYYY"),
            production_hours: p.production_hours,
            created_at: p.created_at && moment(p.created_at).format("DD/MM/YYYY"),
            updated_at: p.updated_at && moment(p.updated_at).format("DD/MM/YYYY"),
            created_by: { id: p.created_by._id, value: p.created_by.username, label: p.created_by.username },
            updated_by: { id: p.updated_by._id, value: p.updated_by.username, label: p.updated_by.username }
        }
    })
    return res.status(200).json(productions)
}
export const CreateProduction = async (req: Request, res: Response, next: NextFunction) => {
    let {
        machine,
        thekedar,
        articles,
        manpower,
        production,
        big_repair,
        production_hours,
        small_repair,
        date,
        upper_damage
    } = req.body as CreateOrEditProductionDto
    let previous_date = new Date()
    let day = previous_date.getDate() - 3
    previous_date.setDate(day)
    // if (new Date(date) < previous_date || new Date(date) > new Date())
    //     return res.status(400).json({ message: "invalid date, should be within last 2 days" })

    let previous_date2 = new Date(date)
    let day2 = previous_date2.getDate() - 3
    previous_date2.setDate(day2)

    let prods = await Production.find({ created_at: { $gte: previous_date2 }, machine: machine })
    prods = prods.filter((prod) => {
        if (prod.date.getDate() === new Date(date).getDate() && prod.date.getMonth() === new Date(date).getMonth() && prod.date.getFullYear() === new Date(date).getFullYear()) {
            return prod
        }
    })
    if (prods.length === 2)
        return res.status(400).json({ message: "not allowed more than 2 productions for the same machine" })

    if (!machine || !thekedar || !articles || !manpower || !production || !date)
        return res.status(400).json({ message: "please fill all reqired fields" })


    let production_date = new Date(date)


    if (articles.length === 0) {
        return res.status(400).json({ message: "select an article" })
    }
    let m1 = await Machine.findById(machine)
    let t1 = await User.findById(thekedar)

    if (!m1 || !t1)
        return res.status(400).json({ message: "not a valid request" })
    let new_prouction = new Production({
        machine: m1,
        thekedar: t1,
        production_hours: production_hours,
        articles: articles,
        manpower: manpower,
        production: production,
        big_repair: big_repair,
        small_repair: small_repair,
        upper_damage: upper_damage
    })

    new_prouction.date = production_date
    new_prouction.created_at = new Date()
    new_prouction.updated_at = new Date()
    if (req.user) {
        new_prouction.created_by = req.user
        new_prouction.updated_by = req.user
    }
    await new_prouction.save()
    return res.status(201).json(new_prouction)
}

export const UpdateProduction = async (req: Request, res: Response, next: NextFunction) => {
    let {
        machine,
        thekedar,
        articles,
        production_hours,
        manpower,
        production,
        big_repair,
        small_repair,
        upper_damage,
        date
    } = req.body as CreateOrEditProductionDto
    let previous_date = new Date()
    let day = previous_date.getDate() - 3
    previous_date.setDate(day)

    // if (new Date(date) < previous_date || new Date(date) > new Date())
    //     return res.status(400).json({ message: "invalid date, should be within last 2 days" })
    if (!machine || !thekedar || !articles || !manpower || !production || !date)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    if (!id)
        return res.status(400).json({ message: "not a valid request" })
    let remote_production = await Production.findById(id)


    if (!remote_production)
        return res.status(404).json({ message: "producton not exists" })

    if (articles.length === 0) {
        return res.status(400).json({ message: "select an article" })
    }
    let m1 = await Machine.findById(machine)
    let t1 = await User.findById(thekedar)

    if (!m1 || !t1)
        return res.status(400).json({ message: "not a valid request" })
    await Production.findByIdAndUpdate(remote_production._id,
        {
            machine: m1,
            thekedar: t1,
            articles: articles,
            manpower: manpower,
            production: production,
            production_hours: production_hours,
            big_repair: big_repair,
            small_repair: small_repair,
            upper_damage: upper_damage,
            created_at: new Date(),
            updated_at: new Date(),
            updated_by: req.user
        })
    return res.status(200).json({ message: "production updated" })
}
export const DeleteProduction = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!id)
        return res.status(400).json({ message: "not a valid request" })
    let remote_production = await Production.findById(id)
    if (!remote_production)
        return res.status(404).json({ message: "producton not exists" })

    await Production.findByIdAndDelete(remote_production._id)
    return res.status(200).json({ message: "production removed" })
}
