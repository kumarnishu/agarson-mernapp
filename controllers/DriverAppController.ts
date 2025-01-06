import { NextFunction, Request, Response } from 'express';
import isMongoId from "validator/lib/isMongoId";
import { IDriverSystem, DriverSystem } from "../models/driver-system.model";
import { IUser } from "../models/user.model";
import { GetDriverSystemDto, CreateDriverSystemDto } from '../dtos/driver.dto';
import moment from 'moment';
import { uploadFileToCloud } from '../services/uploadFileToCloud';


export class DriverAppController {
    public async GetAllDriverSystems(req: Request, res: Response, next: NextFunction) {
        let id = req.query.id
        let start_date = req.query.start_date
        let end_date = req.query.end_date

        let count = 0
        let dt1 = new Date(String(start_date))
        dt1.setHours(0)
        dt1.setMinutes(0)
        let dt2 = new Date(String(end_date))
        dt2.setHours(0)
        dt2.setMinutes(0)

        let result: GetDriverSystemDto[] = []
        let items: IDriverSystem[] = []

        let user_ids = req.user?.assigned_users.map((user: IUser) => { return user._id }) || []
        if (!id) {
            if (user_ids.length > 0) {
                items = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: { $in: user_ids } }).populate('driver').populate('created_by').populate('updated_by').sort("-created_at")

            }

            else {

                items = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: req.user?._id }).populate('driver').populate('created_by').populate('updated_by').sort("-created_at")

            }
        }


        else {
            items = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: id }).populate('driver').populate('created_by').populate('updated_by').sort("-created_at")
            count = await DriverSystem.find({ date: { $gte: dt1, $lt: dt2 }, driver: id }).countDocuments()
        }
        result = items.map((item) => {
            return {
                _id: item._id,
                driver: { id: item.driver._id, label: item.driver.username, value: item.driver.username },
                location: item.location,
                photo: item.photo?.public_url || "",
                created_at: moment(new Date()).format("DD/MM/YYYY"),
                updated_at: moment(new Date()).format("DD/MM/YYYY"),
                created_by: { id: item.created_by._id, label: item.created_by.username, value: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username, value: item.updated_by.username }
            }
        })
        return res.status(200).json(result)

    }

    public async GetMyDriverSystems(req: Request, res: Response, next: NextFunction) {
        let result: GetDriverSystemDto[] = []
        let items: IDriverSystem[] = []
        items = await DriverSystem.find({ driver: req.user._id }).populate('driver').populate('created_by').populate('updated_by').sort('-created_at')
        result = items.map((item) => {
            return {
                _id: item._id,
                driver: { id: item.driver._id, label: item.driver.username, value: item.driver.username },
                location: item.location,
                photo: item.photo?.public_url || "",
                created_at: moment(new Date()).format("DD/MM/YYYY"),
                updated_at: moment(new Date()).format("DD/MM/YYYY"),
                created_by: { id: item.created_by._id, label: item.created_by.username, value: item.created_by.username },
                updated_by: { id: item.updated_by._id, label: item.updated_by.username, value: item.updated_by.username }
            }
        })
        return res.status(200).json(result)
    }

    public async DeleteDriverSystem(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })
        let item = await DriverSystem.findById(id);
        if (!item) {
            return res.status(404).json({ message: "item not found" })
        }

        await DriverSystem.findByIdAndDelete(id);

        return res.status(200).json({ message: "item deleted successfully" })
    }

    public async CreateDriverSystem(req: Request, res: Response, next: NextFunction) {
        let body = JSON.parse(req.body.body)
        console.log(body)
        console.log(req.file)
        let { latitude, longitude } = body as CreateDriverSystemDto
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "please fill all required fields" })
        }

        if (!req.file) {
            return res.status(400).json({ message: "please upload document" })
        }

        const id = req.params.id
        let system = await DriverSystem.findById(id)
        if (!system)
            return res.status(404).json({ message: "item not found" })

        if (req.file) {
            console.log(req.file.mimetype)
            const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
            const storageLocation = `driverapp/media`;
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
            if (req.file.size > 20 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
            const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
            if (doc)
                system.photo = doc
            else {
                return res.status(500).json({ message: "file uploading error" })
            }
        }
        system.updated_at = new Date()
        system.created_at = new Date()

        if (req.user) {
            system.driver = req.user
            system.created_by = req.user
            system.updated_by = req.user
        }

        let address = await (await fetch(`https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&&api_key=${process.env.GECODE_API_KEY}`)).json()

        system.location = address || ""
        await system.save()
        return res.status(201).json(system)
    }
}