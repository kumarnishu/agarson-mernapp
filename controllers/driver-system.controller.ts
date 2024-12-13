import { NextFunction, Request, Response } from 'express';
import isMongoId from 'validator/lib/isMongoId';
import { DriverSystem, IDriverSystem } from '../models/driver-system.model';
import { CreateOrEditDriverSystemDto, GetDriverSystemDto } from '../dtos/driver.dto';
import moment from 'moment';

export const GetAllDriverSystems = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetDriverSystemDto[] = []
    let items: IDriverSystem[] = []
    items = await DriverSystem.find().populate('driver').populate('created_by').populate('updated_by').sort('-created_at')
    result = items.map((item) => {
        return {
            _id: item._id,
            date: moment(item.date).format("DD/MM/YYYY"),
            driver: { id: item.driver._id, label: item.driver.username, value: item.driver.username },
            party: item.party,
            billno: item.billno,
            marka: item.marka,
            transport: item.transport,
            location: item.location,
            photo: item.photo?.public_url || "",
            remarks: item.remarks,
            created_at: moment(new Date()).format("DD/MM/YYYY"),
            updated_at: moment(new Date()).format("DD/MM/YYYY"),
            created_by: { id: item.created_by._id, label: item.created_by.username, value: item.created_by.username },
            updated_by: { id: item.updated_by._id, label: item.updated_by.username, value: item.updated_by.username }
        }
    })
    return res.status(200).json(result)
}



export const CreateDriverSystem = async (req: Request, res: Response, next: NextFunction) => {
    const {
        date,
        driver,
        party,
        billno,
        marka,
        transport,
        remarks } = req.body as CreateOrEditDriverSystemDto
    if (!driver || !party || !billno || !marka || !transport) {
        return res.status(400).json({ message: "please provide required fields" })
    }
    let system = await DriverSystem.findOne({ party: party.toLowerCase(), transport: transport.trim().toLowerCase() })
    if (system && system.transport !== transport.trim().toLowerCase())
        return res.status(400).json({ message: "transport change occurred, already exists one record for that transport" })

    let result = await new DriverSystem({
        date, driver, party, billno, marka, transport, remarks,
        created_at: new Date(),
        created_by: req.user,
        updated_at: new Date(),
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateDriverSystem = async (req: Request, res: Response, next: NextFunction) => {
    const {
        date,
        driver,
        party,
        billno,
        marka,
        transport,
        remarks } = req.body as CreateOrEditDriverSystemDto
    if (!driver || !party || !billno || !marka || !transport) {
        return res.status(400).json({ message: "please provide required fields" })
    }
    const id = req.params.id
    let olditem = await DriverSystem.findById(id)
    if (!olditem)
        return res.status(404).json({ message: "item not found" })

    await DriverSystem.findByIdAndUpdate(id, {
        date,
        driver,
        party,
        billno,
        marka,
        transport,
        remarks, updated_at: new Date(),
        updated_by: req.user
    })
    return res.status(200).json(olditem)

}
export const DeleteDriverSystem = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "item id not valid" })
    let item = await DriverSystem.findById(id);
    if (!item) {
        return res.status(404).json({ message: "item not found" })
    }

    await DriverSystem.findByIdAndDelete(id);

    return res.status(200).json({ message: "item deleted successfully" })
}


// export const UploadDriverSystemPhoto = async (req: Request, res: Response, next: NextFunction) => {
//     let body = JSON.parse(req.body.body) as CreateOrEditShoeWeightDto

//     let dt1 = new Date()
//     let dt2 = new Date()
//     dt2.setDate(new Date(dt2).getDate() + 1)
//     dt1.setHours(0)
//     dt1.setMinutes(0)
//     let { machine, dye, article, weight, month, upper_weight } = body

//     if (!machine || !dye || !article || !weight || !upper_weight)
//         return res.status(400).json({ message: "please fill all reqired fields" })

//     let m1 = await Machine.findById(machine)
//     let d1 = await Dye.findById(dye)
//     let art1 = await Article.findById(article)
//     if (!m1 || !d1 || !art1)
//         return res.status(400).json({ message: "please fill all reqired fields" })
//     if (await SpareDye.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
//         return res.status(400).json({ message: "sorry ! this is a spare dye" })
//     }

//     if (await ShoeWeight.findOne({ dye: dye, created_at: { $gte: dt1, $lt: dt2 } })) {
//         return res.status(400).json({ message: "sorry ! dye is not available" })
//     }


//     let shoe_weight = new ShoeWeight({
//         machine: m1, dye: d1, article: art1, shoe_weight1: weight, month: month, upper_weight1: upper_weight
//     })
//     if (req.file) {
//         console.log(req.file.mimetype)
//         const allowedFiles = ["image/png", "image/jpeg", "image/gif"];
//         const storageLocation = `weights/media`;
//         if (!allowedFiles.includes(req.file.mimetype))
//             return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
//         if (req.file.size > 20 * 1024 * 1024)
//             return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
//         const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
//         if (doc)
//             shoe_weight.shoe_photo1 = doc
//         else {
//             return res.status(500).json({ message: "file uploading error" })
//         }
//     }
//     shoe_weight.created_at = new Date()
//     shoe_weight.updated_at = new Date()
//     if (req.user)
//         shoe_weight.created_by = req.user
//     if (req.user)
//         shoe_weight.updated_by = req.user
//     shoe_weight.weighttime1 = new Date()
//     await shoe_weight.save()
//     return res.status(201).json(shoe_weight)
// }