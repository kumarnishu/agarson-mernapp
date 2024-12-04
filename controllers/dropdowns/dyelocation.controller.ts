import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import moment from "moment";
import isMongoId from "validator/lib/isMongoId";
import { CreateOrEditDyeLocationDto, GetDyeLocationDto } from "../../dtos";
import { DyeLocation, IDyeLocation } from "../../models/dye-location";

export const GetAllDyeLocations = async (req: Request, res: Response, next: NextFunction) => {
    let hidden = String(req.query.hidden)
    let result: GetDyeLocationDto[] = []
    let locations: IDyeLocation[] = []
    if (hidden === "true") {
        locations = await DyeLocation.find({ active: false }).populate('created_by').populate('updated_by')
    } else
        locations = await DyeLocation.find({ active: true }).populate('created_by').populate('updated_by')


    result = locations.map((l) => {
        return {
            _id: l._id,
            name: l.name,
            active: l.active,
            display_name: l.display_name,
            created_at: l.created_at && moment(l.created_at).format("DD/MM/YYYY"),
            updated_at: l.updated_at && moment(l.updated_at).format("DD/MM/YYYY"),
            created_by: { id: l.created_by._id, value: l.created_by.username, label: l.created_by.username },
            updated_by: { id: l.updated_by._id, value: l.updated_by.username, label: l.updated_by.username }
        }
    })
    return res.status(200).json(result)
}


export const CreateDyeLocation = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditDyeLocationDto
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await DyeLocation.findOne({ name: name.toLowerCase() }))
        return res.status(400).json({ message: "already exists this dye location" })
    let result = await new DyeLocation({
        name: name,
        display_name: display_name,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateDyeLocation = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditDyeLocationDto
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await DyeLocation.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "location not found" })
    if (name !== oldlocation.name)
        if (await DyeLocation.findOne({ name: name.toLowerCase() }))
            return res.status(400).json({ message: "already exists this location" })
    oldlocation.name = name
    oldlocation.display_name = display_name
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}

export const ToogleDyeLocation = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "location id not valid" })
    let location = await DyeLocation.findById(id);
    if (!location) {
        return res.status(404).json({ message: "location not found" })
    }
    location.active = !location.active
    location.updated_at = new Date()
    if (req.user)
        location.updated_by = req.user
    await location.save()
    return res.status(200).json({ message: "success" })
}