import { NextFunction, Request, Response } from 'express';
import { ISpareDye, SpareDye } from '../models/spare-dye';
import { CreateOrEditSpareDyeDto, GetSpareDyeDto } from '../dtos';
import { IUser } from '../models/user';
import moment from 'moment';
import { DyeLocation } from '../models/dye-location';
import { Dye } from '../models/dye';
import { ShoeWeight } from '../models/shoe-weight';
import { uploadFileToCloud } from '../utils/uploadFileToCloud';
import { destroyCloudFile } from '../utils/destroyCloudFile';

export const GetMyTodaySpareDye = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date()
    dt1.setDate(new Date().getDate())
    dt1.setUTCHours(0)
    dt1.setMinutes(0)
    let sparedyes: ISpareDye[] = []
    let result: GetSpareDyeDto[] = []
    let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
    if (user_ids.length > 0) {
        sparedyes = await SpareDye.find({ created_at: { $gte: dt1 }, created_by: { $in: user_ids } }).populate('dye').populate('location').populate('created_by').populate('updated_by').sort('-created_at')
    }
    else {
        sparedyes = await SpareDye.find({ created_at: { $gte: dt1 }, created_by: req.user?._id }).populate('dye').populate('location').populate('created_by').populate('updated_by').sort('-created_at')
    }
    result = sparedyes.map((dye) => {
        return {
            _id: dye._id,
            dye: { id: dye._id, value: String(dye.dye.dye_number), label: String(dye.dye.dye_number) },
            repair_required: dye.repair_required,
            is_validated: dye.is_validated,
            dye_photo: dye.dye_photo?.public_url || "",
            photo_time: dye.created_at && moment(dye.photo_time).format("LT"),
            remarks: dye.remarks || "",
            location: { id: dye.location._id, value: dye.location.name, label: dye.location.name },
            created_at: dye.created_at && moment(dye.created_at).format('LT'),
            updated_at: dye.updated_at && moment(dye.updated_at).format('LT'),
            created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
            updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
        }
    })
    return res.status(200).json(result)
}

export const GetSpareDyes = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dyes: ISpareDye[] = []
    let result: GetSpareDyeDto[] = []
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
                dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
                count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: user_ids } }).countDocuments()
            }

            else {
                dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
                count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
            }
        }


        if (id) {
            dyes = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('dye').populate('created_by').populate('location').populate('updated_by').sort('-created_at').skip((page - 1) * limit).limit(limit)
            count = await SpareDye.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }
        result = dyes.map((dye) => {
            return {
                _id: dye._id,
                dye: { id: dye.dye._id, value: String(dye.dye.dye_number), label: String(dye.dye.dye_number) },
                repair_required: dye.repair_required,
                dye_photo: dye.dye_photo?.public_url || "",
                remarks: dye.remarks || "",
                is_validated: dye.is_validated,
                photo_time: dye.created_at && moment(dye.photo_time).format("LT"),
                location: { id: dye.location._id, value: dye.location.name, label: dye.location.name },
                created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
                updated_at: dye.updated_at && moment(dye.updated_at).format("DD/MM/YYYY"),
                created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
                updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
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


export const CreateSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditSpareDyeDto
    let { dye, location, repair_required, remarks } = body

    if (!location || !dye || !remarks)
        if (!dye || !location)
            return res.status(400).json({ message: "please fill all reqired fields" })

    let l1 = await DyeLocation.findById(location)
    let d1 = await Dye.findById(dye)
    if (!d1) {
        return res.status(404).json({ message: "dye not found" })
    }
    if (!l1) {
        return res.status(404).json({ message: "location not found" })
    }
    let dyeObj = new SpareDye({
        dye: d1, location: l1
    })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setUTCHours(0)
    dt1.setMinutes(0)
    if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } }))
        return res.status(400).json({ message: "sorry ! this dye is in machine" })
    if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
        return res.status(400).json({ message: "sorry ! dye is not available" })
    }


    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `dyestatus/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            dyeObj.dye_photo = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    dyeObj.created_at = new Date()
    dyeObj.updated_at = new Date()
    if (remarks)
        dyeObj.remarks = remarks;
    if (req.user)
        dyeObj.created_by = req.user
    dyeObj.repair_required = repair_required;
    if (req.user)
        dyeObj.updated_by = req.user
    dyeObj.photo_time = new Date()
    await dyeObj.save()
    return res.status(201).json(dyeObj)
}

export const UpdateSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body) as CreateOrEditSpareDyeDto
    let { dye, location, repair_required, remarks } = body
    const id = req.params.id
    let dyeObj = await SpareDye.findById(id)
    if (!dyeObj)
        return res.status(404).json({ message: "dye not found" })
    if (!location || !dye || !remarks)
        if (!dye || !location)
            return res.status(400).json({ message: "please fill all reqired fields" })

    let dt1 = new Date()
    let dt2 = new Date()
    dt2.setDate(new Date(dt2).getDate() + 1)
    dt1.setUTCHours(0)
    dt1.setMinutes(0)

    if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } }))
        return res.status(400).json({ message: "sorry ! this dye is in machine" })

    if (dyeObj.dye._id.valueOf() !== dye)
        if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
            return res.status(400).json({ message: "sorry ! dye is not available" })
        }

    let l1 = await DyeLocation.findById(location)
    let d1 = await Dye.findById(dye)
    if (!d1) {
        return res.status(404).json({ message: "dye not found" })
    }
    if (!l1) {
        return res.status(404).json({ message: "location not found" })
    }
    dyeObj.remarks = remarks;
    dyeObj.dye = d1;
    dyeObj.location = l1;
    if (req.file) {
        console.log(req.file.mimetype)
        const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
        const storageLocation = `dyestatus/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            dyeObj.dye_photo = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    dyeObj.created_at = new Date()
    dyeObj.updated_at = new Date()
    if (req.user)
        dyeObj.created_by = req.user
    dyeObj.repair_required = repair_required;
    if (req.user)
        dyeObj.updated_by = req.user
    dyeObj.photo_time = new Date()
    await dyeObj.save()
    return res.status(201).json(dyeObj)
}
export const DeleteSpareDye = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let dye = await SpareDye.findById(id)
    if (!dye)
        return res.status(404).json({ message: "spare dye not found" })
    dye.updated_at = new Date()
    if (req.user)
        dye.updated_by = req.user
    if (dye.dye_photo && dye.dye_photo._id)
        await destroyCloudFile(dye.dye_photo._id)
    await dye.remove()
    return res.status(200).json(dye)
}