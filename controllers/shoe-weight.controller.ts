import { NextFunction, Request, Response } from 'express';

import moment from 'moment';
import { GetShoeWeightDto, CreateOrEditShoeWeightDto } from '../dtos/shoe-weight.dto';
import { Article } from '../models/article.model';
import { Dye } from '../models/dye.model';
import { Machine } from '../models/machine.model';
import { IShoeWeight, ShoeWeight } from '../models/shoe-weight.model';
import { SpareDye } from '../models/spare-dye.model';
import { IUser } from '../models/user.model';
import { destroyCloudFile } from '../services/destroyCloudFile';
import { uploadFileToCloud } from '../services/uploadFileToCloud';


export const GetMyTodayShoeWeights = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date()
    dt1.setDate(new Date().getDate())
    dt1.setHours(0)
    dt1.setMinutes(0)
    let result: GetShoeWeightDto[] = []
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    let weights: IShoeWeight[] = []

    if (user_ids.length > 0) {
        weights = await ShoeWeight.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('machine').populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    else {
        weights = await ShoeWeight.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('machine').populate('dye').populate('article').populate('created_by').populate('updated_by').sort('-updated_at')
    }
    result = weights.map((w) => {
        return {
            _id: w._id,
            machine: { id: w.machine._id, label: w.machine.name, value: w.machine.name },
            dye: { id: w.dye._id, label: String(w.dye.dye_number), value: String(w.dye.dye_number) },
            article: { id: w.article._id, label: w.article.name, value: w.article.name },
            is_validated: w.is_validated,
            month: w.month,
            std_weigtht: w.dye.stdshoe_weight || 0,
            size: w.dye.size || "",
            shoe_weight1: w.shoe_weight1,
            shoe_photo1: w.shoe_photo1?.public_url || "",
            weighttime1: moment(new Date(w.weighttime1)).format('LT'),
            weighttime2: moment(new Date(w.weighttime2)).format('LT'),
            weighttime3: moment(new Date(w.weighttime3)).format('LT'),
            upper_weight1: w.upper_weight1,
            upper_weight2: w.upper_weight2,
            upper_weight3: w.upper_weight3,
            shoe_weight2: w.shoe_weight2,
            shoe_photo2: w.shoe_photo2?.public_url || "",
            shoe_weight3: w.shoe_weight3,
            shoe_photo3: w.shoe_photo3?.public_url || "",
            created_at: moment(w.created_at).format("DD/MM/YYYY"),
            updated_at: moment(w.updated_at).format("DD/MM/YYYY"),
            created_by: { id: w.created_by._id, value: w.created_by.username, label: w.created_by.username },
            updated_by: { id: w.updated_by._id, value: w.updated_by.username, label: w.updated_by.username },
        }
    })
    return res.status(200).json(result)
}


export const GetShoeWeights = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let weights: IShoeWeight[] = []
    let result: GetShoeWeightDto[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    let dt2 = new Date(String(end_date))
    dt2.setHours(0)
    dt2.setMinutes(0)
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    console.log(user_ids)
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (!id) {
            if (user_ids.length > 0) {
                weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await ShoeWeight.find({ created_at: { $gt: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
            }

            else {
                weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
                count = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
            }
            console.log(weights.length)
        }


        if (id) {
            weights = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('machine').populate('article').populate('created_by').populate('updated_by').sort("-created_at").skip((page - 1) * limit).limit(limit)
            count = await ShoeWeight.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }
        result = weights.map((w) => {
            return {
                _id: w._id,
                machine: { id: w.machine._id, label: w.machine.name, value: w.machine.name },
                dye: { id: w.dye._id, label: String(w.dye.dye_number), value: String(w.dye.dye_number) },
                article: { id: w.article._id, label: w.article.name, value: w.article.name },
                size: w.dye.size || "",
                is_validated: w.is_validated,
                month: w.month,
                std_weigtht: w.dye.stdshoe_weight || 0,
                shoe_weight1: w.shoe_weight1,
                shoe_photo1: w.shoe_photo1?.public_url || "",
                weighttime1: moment(new Date(w.weighttime1)).format('LT'),
                weighttime2: moment(new Date(w.weighttime2)).format('LT'),
                weighttime3: moment(new Date(w.weighttime3)).format('LT'),
                upper_weight1: w.upper_weight1,
                upper_weight2: w.upper_weight2,
                upper_weight3: w.upper_weight3,
                shoe_weight2: w.shoe_weight2,
                shoe_photo2: w.shoe_photo2?.public_url || "",
                shoe_weight3: w.shoe_weight3,
                shoe_photo3: w.shoe_photo3?.public_url || "",
                created_at: moment(w.created_at).format("DD/MM/YYYY"),
                updated_at: moment(w.updated_at).format("DD/MM/YYYY"),
                created_by: { id: w.created_by._id, value: w.created_by.username, label: w.created_by.username },
                updated_by: { id: w.updated_by._id, value: w.updated_by.username, label: w.updated_by.username },
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

export const CreateShoeWeight = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })

    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! dye is not available" })
    }


    let shoe_weight = new ShoeWeight({
        machine: m1, dye: d1, article: art1, shoe_weight1: weight, month: month, upper_weight1: upper_weight
    })
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo1 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    shoe_weight.created_at = new Date()
    shoe_weight.updated_at = new Date()
    if (req.user)
        shoe_weight.created_by = req.user
    if (req.user)
        shoe_weight.updated_by = req.user
    shoe_weight.weighttime1 = new Date()
    await shoe_weight.save()
    return res.status(201).json(shoe_weight)
}
export const UpdateShoeWeight1 = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })

    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    //@ts-ignore

    if (shoe_weight.dye !== dye)
        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


    if (shoe_weight.shoe_photo1 && shoe_weight.shoe_photo1._id)
        await destroyCloudFile(shoe_weight.shoe_photo1._id)
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo1 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    shoe_weight.machine = m1
    shoe_weight.dye = d1
    shoe_weight.month = month
    shoe_weight.upper_weight1 = upper_weight;
    shoe_weight.article = art1
    shoe_weight.shoe_weight1 = weight
    shoe_weight.created_at = new Date()
    shoe_weight.weighttime1 = new Date()
    shoe_weight.updated_at = new Date()
    if (req.user) {

        shoe_weight.created_by = req.user
        shoe_weight.updated_by = req.user
    }
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}
export const UpdateShoeWeight2 = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
    console.log(body)
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    //@ts-ignore
    if (shoe_weight.dye._id.valueOf() !== dye)
        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill  reqired fields" })
    if (shoe_weight.shoe_photo2 && shoe_weight.shoe_photo2._id)
        await destroyCloudFile(shoe_weight.shoe_photo2._id)
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo2 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    shoe_weight.machine = m1
    shoe_weight.dye = d1
    shoe_weight.month = month
    shoe_weight.article = art1
    shoe_weight.upper_weight2 = upper_weight;
    shoe_weight.shoe_weight2 = weight
    shoe_weight.weighttime2 = new Date()
    shoe_weight.created_at = new Date()
    shoe_weight.updated_at = new Date()
    if (req.user) {
        shoe_weight.created_by = req.user
        shoe_weight.updated_by = req.user
    }
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}
export const UpdateShoeWeight3 = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto
    let { machine, dye, article, weight, month, upper_weight } = body

    if (!machine || !dye || !article || !weight || !upper_weight)
        return res.status(400).json({ message: "please fill all reqired fields" })
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setHours(0)
    dt1.setMinutes(0)
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! this is a spare dye" })
    }

    if (shoe_weight.dye._id.valueOf() !== dye)
        if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }


    let m1 = await Machine.findById(machine)
    let d1 = await Dye.findById(dye)
    let art1 = await Article.findById(article)
    if (!m1 || !d1 || !art1)
        return res.status(400).json({ message: "please fill all reqired fields" })
    if (shoe_weight.shoe_photo3 && shoe_weight.shoe_photo3._id)
        await destroyCloudFile(shoe_weight.shoe_photo3._id)
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `weights/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            shoe_weight.shoe_photo3 = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    shoe_weight.machine = m1
    shoe_weight.upper_weight3 = upper_weight;
    shoe_weight.dye = d1
    shoe_weight.month = month
    shoe_weight.article = art1
    shoe_weight.shoe_weight3 = weight
    shoe_weight.created_at = new Date()
    shoe_weight.updated_at = new Date()
    shoe_weight.weighttime3 = new Date()
    if (req.user) {
        shoe_weight.created_by = req.user
        shoe_weight.updated_by = req.user
    }
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}

export const ValidateShoeWeight = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })
    shoe_weight.is_validated = true
    shoe_weight.updated_at = new Date()
    if (req.user)
        shoe_weight.updated_by = req.user
    await shoe_weight.save()
    return res.status(200).json(shoe_weight)
}
export const ValidateSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let sparedye = await SpareDye.findById(id)
    if (!sparedye)
        return res.status(404).json({ message: "spare dye not found" })
    sparedye.is_validated = true
    sparedye.updated_at = new Date()
    if (req.user)
        sparedye.updated_by = req.user
    await sparedye.save()
    return res.status(200).json(sparedye)
}
export const DeleteShoeWeight = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let shoe_weight = await ShoeWeight.findById(id)
    if (!shoe_weight)
        return res.status(404).json({ message: "shoe weight not found" })
    shoe_weight.is_validated = true
    shoe_weight.updated_at = new Date()
    if (req.user)
        shoe_weight.updated_by = req.user
    if (shoe_weight.shoe_photo1 && shoe_weight.shoe_photo1._id)
        await destroyCloudFile(shoe_weight.shoe_photo1._id)
    if (shoe_weight.shoe_photo2 && shoe_weight.shoe_photo2._id)
        await destroyCloudFile(shoe_weight.shoe_photo2._id)
    if (shoe_weight.shoe_photo3 && shoe_weight.shoe_photo3._id)
        await destroyCloudFile(shoe_weight.shoe_photo3._id)
    await shoe_weight.remove()
    return res.status(200).json(shoe_weight)
}
