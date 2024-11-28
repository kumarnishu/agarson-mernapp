import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { CreateOrEditCrmCity, DropDownDto, GetCityFromExcelDto, GetCrmCityDto } from "../dtos";
import { assignCRMCities } from "../utils/assignCRMCities";
import { CRMCity, ICRMCity } from "../models/crm-city";
import { User } from "../models/user";
import { CRMState } from "../models/crm-state";
import Lead from "../models/lead";
import { ReferredParty } from "../models/refer";
import isMongoId from "validator/lib/isMongoId";


export const AssignCRMCitiesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { city_ids, user_ids, flag } = req.body as { city_ids: string[], user_ids: string[], flag: number }

    if (city_ids && city_ids.length === 0)
        return res.status(400).json({ message: "please select one city " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one city owner" })
    await assignCRMCities(user_ids, city_ids, flag);
    return res.status(200).json({ message: "successfull" })
}

export const GetAllCRMCities = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetCrmCityDto[] = []
    let state = req.query.state;
    let cities: ICRMCity[] = []
    if (state && state !== 'all')
        cities = await CRMCity.find({ state: state })
    else
        cities = await CRMCity.find()
    for (let i = 0; i < cities.length; i++) {
        let users = await (await User.find({ assigned_crm_cities: cities[i]._id })).
            map((i) => { return { _id: i._id.valueOf(), username: i.username } })
        result.push(
            {
                _id: cities[i]._id,
                city: cities[i].city,
                alias1: cities[i].alias1,
                alias2: cities[i].alias2,
                state: cities[0].state,
                assigned_users: String(users.map((u) => { return u.username }))
            });
    }
    return res.status(200).json(result)
}
export const GetAllCRMCitiesForDropDown = async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let state = req.query.state;
    let cities: ICRMCity[] = []
    if (state && state !== 'all')
        cities = await CRMCity.find({ state: state })
    else
        cities = await CRMCity.find()
    result = cities.map((c) => {
        return {
            id: c._id, label: c.city, value: c.city
        }
    })
    return res.status(200).json(result)
}

export const CreateCRMCity = async (req: Request, res: Response, next: NextFunction) => {
    const { state, city, alias1, alias2 } = req.body as CreateOrEditCrmCity
    if (!state || !city) {
        return res.status(400).json({ message: "please provide required fields" })
    }
    let STate = await CRMState.findOne({ state: state })
    if (!STate) {
        return res.status(400).json({ message: "state not exits" })
    }
    if (await CRMCity.findOne({ city: city.toLowerCase(), state: state }))
        return res.status(400).json({ message: "already exists this city" })
    let result = await new CRMCity({
        state: state,
        alias1,
        alias2,
        city: city,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    let users = await User.find({ assigned_crm_states: STate });
    await assignCRMCities(users.map((i) => { return i._id.valueOf() }), [result._id.valueOf()], 1);
    return res.status(201).json(result)

}

export const UpdateCRMCity = async (req: Request, res: Response, next: NextFunction) => {
    const { state, city, alias1, alias2 } = req.body as CreateOrEditCrmCity
    if (!state || !city) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (!await CRMState.findOne({ state: state })) {
        return res.status(400).json({ message: "state not exits" })
    }
    const id = req.params.id
    let oldcity = await CRMCity.findById(id)
    if (!oldcity)
        return res.status(404).json({ message: "city not found" })
    if (city !== oldcity.city)
        if (await CRMCity.findOne({ city: city.toLowerCase(), state: state }))
            return res.status(400).json({ message: "already exists this city" })
    let prevcity = oldcity.city
    oldcity.city = city
    oldcity.alias1 = alias1
    oldcity.alias2 = alias2
    oldcity.state = state
    oldcity.updated_at = new Date()
    if (req.user)
        oldcity.updated_by = req.user
    await oldcity.save()
    await Lead.updateMany({ city: prevcity }, { city: city })
    await ReferredParty.updateMany({ city: prevcity }, { city: city })
    return res.status(200).json(oldcity)

}
export const DeleteCRMCity = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "city id not valid" })
    let city = await CRMCity.findById(id);
    if (!city) {
        return res.status(404).json({ message: "city not found" })
    }

    let STate = await CRMState.findOne({ state: city.state });
    if (STate) {
        let users = await User.find({ assigned_crm_states: STate });
        await assignCRMCities(users.map((i) => { return i._id.valueOf() }), [city._id.valueOf()], 1);
    }
    await city.remove();
    return res.status(200).json({ message: "city deleted successfully" })
}
export const BulkCreateAndUpdateCRMCityFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let state = req.params.state
    let result: GetCityFromExcelDto[] = []
    let statusText: string = ""
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (state && req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: GetCityFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (!state || !await CRMState.findOne({ state: state }))
            return res.status(400).json({ message: "provide a state first" })
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let item = workbook_response[i]
            let city: string | null = String(item.city)


            if (city) {
                if (item._id && isMongoId(String(item._id))) {
                    let oldcity = await CRMCity.findById(item._id)
                    if (oldcity) {
                        if (city !== oldcity.city)
                            if (!await CRMCity.findOne({ city: city.toLowerCase(), state: state })) {
                                oldcity.city = city
                                oldcity.state = state
                                oldcity.updated_at = new Date()
                                if (req.user)
                                    oldcity.updated_by = req.user
                                await oldcity.save()
                                statusText = "updated"

                            }
                    }
                }

                if (!item._id || !isMongoId(String(item._id))) {
                    let oldcity = await CRMCity.findOne({ city: city.toLowerCase(), state: state })
                    if (!oldcity) {
                        await new CRMCity({
                            city: city,
                            state: state,
                            created_by: req.user,
                            updated_by: req.user,
                            created_at: new Date(),
                            updated_at: new Date()
                        }).save()
                        statusText = "created"
                    }
                    else
                        statusText = "duplicate"
                }

            }
            else
                statusText = "required city"

            result.push({
                ...item,
                status: statusText
            })
        }


    }
    return res.status(200).json(result);
}

export const FindUnknownCrmCities = async (req: Request, res: Response, next: NextFunction) => {
    let cities = await CRMCity.find({ city: { $ne: "" } });
    let cityvalues = cities.map(i => { return i.city });

    await CRMCity.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    await Lead.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    await ReferredParty.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    return res.status(200).json({ message: "successfull" })
}
