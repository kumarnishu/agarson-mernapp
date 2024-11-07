import { NextFunction, Request, Response } from 'express';
import { ISoleThickness, SoleThickness } from '../models/sole-thickness';
import { CreateOrEditSoleThicknessDto, GetSoleThicknessDto } from '../dtos';
import { IUser } from '../models/user';
import moment from 'moment';
import { Article } from '../models/article';
import { Dye } from '../models/dye';
export const GetMyTodaySoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    console.log("enterd")
    let dt1 = new Date()
    dt1.setDate(new Date().getDate())
    dt1.setUTCHours(0)
    dt1.setMinutes(0)
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    let items: ISoleThickness[] = []
    let result: GetSoleThicknessDto[] = []

    if (user_ids.length > 0) {
        items = await SoleThickness.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    else {
        items = await SoleThickness.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    result = items.map((item) => {
        return {
            _id: item._id,
            dye: { id: item.dye._id, value: item.dye.dye_number.toString(), label: item.dye.dye_number.toString() },
            article: { id: item.article._id, value: item.article.name, label: item.article.name },
            size: item.size,
            left_thickness: item.left_thickness,
            right_thickness: item.right_thickness,
            created_at: item.created_at ? moment(item.created_at).format('LT') : "",
            updated_at: item.updated_at ? moment(item.updated_at).format('LT') : "",
            created_by: { id: item.created_by._id, value: item.created_by.username, label: item.created_by.username },
            updated_by: { id: item.updated_by._id, value: item.updated_by.username, label: item.updated_by.username }
        }
    })
    return res.status(200).json(result)
}

export const GetSoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let result: GetSoleThicknessDto[] = []
    let items: ISoleThickness[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    dt1.setUTCHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setUTCHours(0)
    dt2.setMinutes(0)
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (!id) {
            if (user_ids.length > 0) {
                items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
            }

            else {
                items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
            }
        }


        if (id) {
            items = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
            count = await SoleThickness.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }

        result = items.map((item) => {
            return {
                _id: item._id,
                dye: { id: item.dye._id, value: item.dye.dye_number.toString(), label: item.dye.dye_number.toString() },
                article: { id: item.article._id, value: item.article.name, label: item.article.name },
                size: item.size,
                left_thickness: item.left_thickness,
                right_thickness: item.right_thickness,
                created_at: item.created_at ? moment(item.created_at).format('DD/MM/YYYY') : "",
                updated_at: item.updated_at ? moment(item.updated_at).format('DD/MM/YYYY') : "",
                created_by: { id: item.created_by._id, value: item.created_by.username, label: item.created_by.username },
                updated_by: { id: item.updated_by._id, value: item.updated_by.username, label: item.updated_by.username }
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
        return res.status(200).json({ message: "bad request" })
}
export const CreateSoleThickness = async (req: Request, res: Response, next: NextFunction) => {

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setUTCHours(0)
    dt1.setMinutes(0)
    let { dye, article, size, left_thickness, right_thickness } = req.body as CreateOrEditSoleThicknessDto

    if (!size || !dye || !article || !left_thickness || !right_thickness)
        return res.status(400).json({ message: "please fill all reqired fields" })

    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })


    if (await SoleThickness.findOne({ dye: dye, article: article, size: size, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry !selected dye,article or size not available" })
    }
    let thickness = new SoleThickness({
        dye: d1, article: art1, size: size, left_thickness: left_thickness, right_thickness: right_thickness,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()

    return res.status(201).json(thickness)
}
export const UpdateSoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setUTCHours(0)
    dt1.setMinutes(0)
    let { dye, article, size, left_thickness, right_thickness } = req.body as CreateOrEditSoleThicknessDto

    if (!size || !dye || !article || !left_thickness || !right_thickness)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let thickness = await SoleThickness.findById(id)
    if (!thickness)
        return res.status(404).json({ message: "not found" })

    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })

    //@ts-ignore
    if (thickness.size !== size || thickness.article !== article || thickness.dye !== dye)
        if (await SoleThickness.findOne({ dye: dye, article: article, size: size, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry !selected dye,article or size not available" })
        }

    await SoleThickness.findByIdAndUpdate(id, {
        dye: d1, article: art1, size: size, left_thickness: left_thickness, right_thickness: right_thickness,
        updated_at: new Date(),
        updated_by: req.user
    })
    return res.status(200).json(thickness)
}
export const DeleteSoleThickness = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let thickness = await SoleThickness.findById(id)
    if (!thickness)
        return res.status(404).json({ message: " not found" })
    await thickness.remove()
    return res.status(200).json(thickness)
}