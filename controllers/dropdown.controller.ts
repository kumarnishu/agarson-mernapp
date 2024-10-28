import { NextFunction, Request, Response } from "express"
import { CreateOrEditDropDownDto, DropDownDto } from "../dtos/dropdown.dto"
import { LeadType } from "../models/dropdown/crm.leadtype.model"
import Lead from "../models/features/lead.model"
import { ReferredParty } from "../models/features/referred.model"
import isMongoId from "validator/lib/isMongoId"
import { Stage } from "../models/dropdown/crm.stage.model"
import { LeadSource } from "../models/dropdown/crm.source.model"
import { AssignOrRemoveCrmCityDto, AssignOrRemoveCrmStateDto, CreateAndUpdatesCityFromExcelDto, CreateAndUpdatesStateFromExcelDto, CreateOrEditCrmCity, GetCrmCityDto, GetCrmStateDto } from "../dtos/crm.dto"
import { CRMState, ICRMState } from "../models/dropdown/crm.state.model"
import { User } from "../models/features/user.model"
import { HandleCRMCitiesAssignment } from "../utils/AssignCitiesToUsers"
import { CRMCity, ICRMCity } from "../models/dropdown/crm.city.model"
import xlsx from "xlsx"
import { ChecklistCategory } from "../models/features/checklist.model"
import { ErpEmployee } from "../models/dropdown/erp.employee.model"
import { CreateOrEditErpEmployeeDto, CreateOrEditErpStateDto, GetErpEmployeeDto, GetErpStateDto } from "../dtos/erp.reports.dto"
import moment from "moment"
import { State } from "../models/dropdown/state.model"
import mongoose from "mongoose"
import { CreateOrEditArticleDto, CreateOrEditDyeDTo, CreateOrEditDyeDtoFromExcel, CreateOrEditDyeLocationDto, CreateOrEditMachineDto, GetArticleDto, GetDyeDto, GetDyeLocationDto, GetMachineDto } from "../dtos/production.dto"
import { DyeLocation, IDyeLocation } from "../models/dropdown/dye.location.model"
import { Dye, IDye } from "../models/dropdown/dye.model"
import { Article, IArticle } from "../models/dropdown/article.model"
import { IMachine, Machine } from "../models/dropdown/machine.model"
import { MachineCategory } from "../models/dropdown/category.machine.model"
import { MaintenanceCategory } from "../models/dropdown/maintainence.category.model"

export const GetAllCRMLeadTypes = async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let types = await LeadType.find()
    result = types.map((t) => {
        return { id: t._id, value: t.type, label: t.type }
    })
    return res.status(200).json(result)
}
export const CreateCRMLeadTypes = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await LeadType.findOne({ type: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this type" })
    let result = await new LeadType({
        type: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json({ message: "success" })

}

export const UpdateCRMLeadTypes = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldtype = await LeadType.findById(id)
    if (!oldtype)
        return res.status(404).json({ message: "type not found" })
    if (key !== oldtype.type)
        if (await LeadType.findOne({ type: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this type" })
    let prevtype = oldtype.type
    oldtype.type = key
    oldtype.updated_at = new Date()
    if (req.user)
        oldtype.updated_by = req.user
    await Lead.updateMany({ type: prevtype }, { type: key })
    await ReferredParty.updateMany({ type: prevtype }, { type: key })
    await oldtype.save()
    return res.status(200).json({ message: "updated" })

}
export const DeleteCRMLeadType = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "type id not valid" })
    let type = await LeadType.findById(id);
    if (!type) {
        return res.status(404).json({ message: "type not found" })
    }
    await type.remove();
    return res.status(200).json({ message: "lead type deleted successfully" })
}

export const GetAllCRMLeadSources = async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let sources = await LeadSource.find()
    result = sources.map((i) => {
        return { id: i._id, value: i.source, label: i.source }
    })
    return res.status(200).json(result)
}


export const CreateCRMLeadSource = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await LeadSource.findOne({ source: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this source" })
    let result = await new LeadSource({
        source: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateCRMLeadSource = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldsource = await LeadSource.findById(id)
    if (!oldsource)
        return res.status(404).json({ message: "source not found" })
    if (key !== oldsource.source)
        if (await LeadSource.findOne({ source: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this source" })
    let prevsource = oldsource.source
    oldsource.source = key
    oldsource.updated_at = new Date()
    if (req.user)
        oldsource.updated_by = req.user
    await Lead.updateMany({ source: prevsource }, { source: key })
    await ReferredParty.updateMany({ source: prevsource }, { source: key })
    await oldsource.save()
    return res.status(200).json(oldsource)

}
export const DeleteCRMLeadSource = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "source id not valid" })
    let source = await LeadSource.findById(id);
    if (!source) {
        return res.status(404).json({ message: "source not found" })
    }
    await source.remove();
    return res.status(200).json({ message: "lead source deleted successfully" })
}


//lead stages
export const GetAllCRMLeadStages = async (req: Request, res: Response, next: NextFunction) => {
    let stages: DropDownDto[] = []
    stages = await (await Stage.find()).map((i) => { return { id: i._id, label: i.stage, value: i.stage } });
    return res.status(200).json(stages)
}


export const CreateCRMLeadStages = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Stage.findOne({ stage: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this stage" })
    let result = await new Stage({
        stage: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateCRMLeadStages = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto

    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldstage = await Stage.findById(id)
    if (!oldstage)
        return res.status(404).json({ message: "stage not found" })
    if (key !== oldstage.stage)
        if (await Stage.findOne({ stage: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this stage" })
    let prevstage = oldstage.stage
    oldstage.stage = key
    oldstage.updated_at = new Date()
    if (req.user)
        oldstage.updated_by = req.user
    await Lead.updateMany({ stage: prevstage }, { stage: key })
    await ReferredParty.updateMany({ stage: prevstage }, { stage: key })
    await oldstage.save()
    return res.status(200).json(oldstage)

}
export const DeleteCRMLeadStage = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "stage id not valid" })
    let stage = await Stage.findById(id);
    if (!stage) {
        return res.status(404).json({ message: "stage not found" })
    }
    await stage.remove();
    return res.status(200).json({ message: "lead stage deleted successfully" })
}
export const GetAllCRMStates = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetCrmStateDto[] = []
    let states = await CRMState.find()

    for (let i = 0; i < states.length; i++) {
        let users = await (await User.find({ assigned_crm_states: states[i]._id })).map((i) => { return { _id: i._id.valueOf(), username: i.username } })
        result.push({ _id: states[i]._id, state: states[i].state, assigned_users: String(users.map((u) => { return u.username })) });
    }
    return res.status(200).json(result)
}


export const CreateCRMState = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await CRMState.findOne({ state: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this state" })
    let result = await new CRMState({
        state: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const AssignCRMCitiesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { city_ids, user_ids, flag } = req.body as AssignOrRemoveCrmCityDto

    if (city_ids && city_ids.length === 0)
        return res.status(400).json({ message: "please select one city " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one city owner" })
    await HandleCRMCitiesAssignment(user_ids, city_ids, flag);
    return res.status(200).json({ message: "successfull" })
}

export const AssignCRMStatesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { state_ids, user_ids, flag } = req.body as AssignOrRemoveCrmStateDto
    if (state_ids && state_ids.length === 0)
        return res.status(400).json({ message: "please select one state " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one state owner" })

    let owners = user_ids

    if (flag == 0) {
        for (let k = 0; k < owners.length; k++) {
            let owner = await User.findById(owners[k]).populate('assigned_crm_states').populate('assigned_crm_cities');;
            if (owner) {
                let oldstates = owner.assigned_crm_states.map((item) => { return item._id.valueOf() });
                oldstates = oldstates.filter((item) => { return !state_ids.includes(item) });
                let newStates: ICRMState[] = [];

                for (let i = 0; i < oldstates.length; i++) {
                    let state = await CRMState.findById(oldstates[i]);
                    if (state)
                        newStates.push(state)
                }

                let crm_cities = await CRMCity.find({ state: { $in: newStates.map(i => { return i.state }) } })

                await User.findByIdAndUpdate(owner._id, {
                    assigned_crm_states: oldstates,
                    assigned_crm_cities: crm_cities
                })
            }
        }
    }
    else {
        for (let k = 0; k < owners.length; k++) {
            const user = await User.findById(owners[k]).populate('assigned_crm_states').populate('assigned_crm_cities');
            if (user) {
                let assigned_states = user.assigned_crm_states;
                for (let i = 0; i <= state_ids.length; i++) {
                    if (!assigned_states.map(i => { return i._id.valueOf() }).includes(state_ids[i])) {
                        let state = await CRMState.findById(state_ids[i]);
                        if (state)
                            assigned_states.push(state)
                    }
                }

                user.assigned_crm_states = assigned_states
                let cities = await CRMCity.find({ state: { $in: assigned_states.map(i => { return i.state }) } })
                user.assigned_crm_cities = cities;
                await user.save();
            }

        }
    }

    return res.status(200).json({ message: "successfull" })
}


export const UpdateCRMState = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldstate = await CRMState.findById(id)
    if (!oldstate)
        return res.status(404).json({ message: "state not found" })
    if (key !== oldstate.state)
        if (await CRMState.findOne({ state: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this state" })
    let prevstate = oldstate.state
    oldstate.state = key
    oldstate.updated_at = new Date()
    if (req.user)
        oldstate.updated_by = req.user

    await Lead.updateMany({ state: prevstate }, { state: key })
    await ReferredParty.updateMany({ state: prevstate }, { state: key })

    await oldstate.save()
    return res.status(200).json(oldstate)

}
export const DeleteCRMState = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "state id not valid" })
    let state = await CRMState.findById(id);
    if (!state) {
        return res.status(404).json({ message: "state not found" })
    }

    await state.remove();
    return res.status(200).json({ message: "state deleted successfully" })
}
export const BulkCreateAndUpdateCRMStatesFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateAndUpdatesStateFromExcelDto[] = []
    let statusText: string = ""
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: ICRMState[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let item = workbook_response[i]
            let state: string | null = String(item.state)


            if (state) {
                if (item._id && isMongoId(String(item._id))) {
                    await CRMState.findByIdAndUpdate(item._id, { state: state.toLowerCase() })
                    statusText = "updated"
                }

                if (!item._id || !isMongoId(String(item._id))) {
                    let oldstate = await CRMState.findOne({ state: state.toLowerCase() })
                    if (!oldstate) {
                        await new CRMState({
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
                statusText = "required state"

            result.push({
                ...item,
                status: statusText
            })
        }


    }
    return res.status(200).json(result);
}

//cities
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
                state: cities[0].state,
                assigned_users: String(users.map((u) => { return u.username }))
            });
    }
    return res.status(200).json(result)
}


export const CreateCRMCity = async (req: Request, res: Response, next: NextFunction) => {
    const { state, city } = req.body as CreateOrEditCrmCity
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
        city: city,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    let users = await User.find({ assigned_crm_states: STate });
    await HandleCRMCitiesAssignment(users.map((i) => { return i._id.valueOf() }), [result._id.valueOf()], 1);
    return res.status(201).json(result)

}

export const UpdateCRMCity = async (req: Request, res: Response, next: NextFunction) => {
    const { state, city } = req.body as CreateOrEditCrmCity
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
        await HandleCRMCitiesAssignment(users.map((i) => { return i._id.valueOf() }), [city._id.valueOf()], 1);
    }
    await city.remove();
    return res.status(200).json({ message: "city deleted successfully" })
}
export const BulkCreateAndUpdateCRMCityFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let state = req.params.state
    let result: CreateAndUpdatesCityFromExcelDto[] = []
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
        let workbook_response: CreateAndUpdatesCityFromExcelDto[] = xlsx.utils.sheet_to_json(
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
export const FindUnknownCrmSates = async (req: Request, res: Response, next: NextFunction) => {
    let states = await CRMState.find({ state: { $ne: "" } });
    let statevalues = states.map(i => { return i.state });
    await Lead.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
    await ReferredParty.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
    return res.status(200).json({ message: "successfull" })
}
export const FindUnknownCrmStages = async (req: Request, res: Response, next: NextFunction) => {
    let stages = await Stage.find({ stage: { $ne: "" } });
    let stagevalues = stages.map(i => { return i.stage });
    await Lead.updateMany({ stage: { $nin: stagevalues } }, { stage: 'unknown' });
    return res.status(200).json({ message: "successfull" })
}

export const FindUnknownCrmCities = async (req: Request, res: Response, next: NextFunction) => {
    let cities = await CRMCity.find({ city: { $ne: "" } });
    let cityvalues = cities.map(i => { return i.city });

    await CRMCity.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    await Lead.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    await ReferredParty.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    return res.status(200).json({ message: "successfull" })
}


export const GetAllChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    let result = await ChecklistCategory.find();
    let data: DropDownDto[];
    data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(data)
}

export const CreateChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ChecklistCategory.findOne({ category: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new ChecklistCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await ChecklistCategory.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "category not found" })
    console.log(key, oldlocation.category)
    if (key !== oldlocation.category)
        if (await ChecklistCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    oldlocation.category = key
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}
export const DeleteChecklistCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await ChecklistCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
}

export const GetAllStates = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetErpStateDto[] = []
    let states = await State.find()
    for (let i = 0; i < states.length; i++) {
        let users = await User.find({ assigned_states: states[i]._id })
        result.push({
            _id: states[i]._id,
            state: states[i].state,
            apr: states[i].apr,
            may: states[i].may,
            jun: states[i].jun,
            jul: states[i].jul,
            aug: states[i].aug,
            sep: states[i].sep,
            oct: states[i].oct,
            nov: states[i].nov,
            dec: states[i].dec,
            jan: states[i].jan,
            feb: states[i].feb,
            mar: states[i].mar,
            created_at: moment(states[i].created_at).format("DD/MM/YYYY"),
            updated_at: moment(states[i].updated_at).format("DD/MM/YYYY"),
            created_by: { id: states[i].created_by._id, label: states[i].created_by.username, value: states[i].created_by.username },
            updated_by: { id: states[i].updated_by._id, label: states[i].updated_by.username, value: states[i].updated_by.username },
            assigned_users: users.map((u) => { return u.username }).toString()
        })
    }
    return res.status(200).json(result)
}

export const CreateState = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as CreateOrEditErpStateDto;
    if (!body.state) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await State.findOne({ state: body.state }))
        return res.status(400).json({ message: "already exists this state" })
    let result = await new State({
        ...body,
        _id: new mongoose.Types.ObjectId(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateState = async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body as CreateOrEditErpStateDto;
    if (!body.state) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldstate = await State.findById(id)
    if (!oldstate)
        return res.status(404).json({ message: "state not found" })
    if (body.state !== oldstate.state)
        if (await State.findOne({ state: body.state }))
            return res.status(400).json({ message: "already exists this state" })
    await State.findByIdAndUpdate(oldstate._id, { ...body, updated_by: req.user, updated_at: new Date() })
    return res.status(200).json(oldstate)

}

export const DeleteErpState = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "state id not valid" })
    let state = await State.findById(id);
    if (!state) {
        return res.status(404).json({ message: "state not found" })
    }
    await state.remove();
    return res.status(200).json({ message: "state deleted successfully" })
}

export const GetAllErpEmployees = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetErpEmployeeDto[] = []
    let employees = await ErpEmployee.find()
    for (let i = 0; i < employees.length; i++) {
        let users = await User.find({ assigned_erpEmployees: employees[i]._id })
        result.push({
            _id: employees[i]._id,
            name: employees[i].name,
            display_name: employees[i].display_name,
            created_at: moment(employees[i].created_at).format("DD/MM/YYYY"),
            updated_at: moment(employees[i].updated_at).format("DD/MM/YYYY"),
            created_by: employees[i].created_by.username,
            updated_by: employees[i].updated_by.username,
            assigned_employees: users.map((u) => { return u.username }).toString()
        })
    }
    return res.status(200).json(result)
}

export const CreateErpEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditErpEmployeeDto;
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ErpEmployee.findOne({ name: name }))
        return res.status(400).json({ message: "already exists this employee" })
    let result = await new ErpEmployee({
        name,
        display_name,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateErpEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditErpEmployeeDto;
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let emp = await ErpEmployee.findById(id)
    if (!emp)
        return res.status(404).json({ message: "state not found" })
    if (name !== emp.name)
        if (await ErpEmployee.findOne({ name: name }))
            return res.status(400).json({ message: "already exists this state" })
    await ErpEmployee.findByIdAndUpdate(emp._id, { name, display_name, updated_by: req.user, updated_at: new Date() })
    return res.status(200).json(emp)

}

export const DeleteErpEmployee = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "employee id not valid" })
    let employee = await ErpEmployee.findById(id);
    if (!employee) {
        return res.status(404).json({ message: "employee not found" })
    }
    await employee.remove();
    return res.status(200).json({ message: "employee deleted successfully" })
}



export const GetAllMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    let result = await MaintenanceCategory.find();
    let data: DropDownDto[];
    data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(data)
}

export const CreateMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await MaintenanceCategory.findOne({ category: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new MaintenanceCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}

export const UpdateMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as {
        key: string,
    }
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await MaintenanceCategory.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "category not found" })
    console.log(key, oldlocation.category)
    if (key !== oldlocation.category)
        if (await MaintenanceCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    oldlocation.category = key
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

}


export const ToogleMaintenanceCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await MaintenanceCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    category.active = !category.active;
    await category.save();
    return res.status(200).json({ message: "category status changed successfully" })
}


export const GetMachineCategories = async (req: Request, res: Response, next: NextFunction) => {
    let result = (await MachineCategory.find()).map((c) => {
        return { id: c._id, label: c.category, value: c.category }
    })
    return res.status(200).json(result)
}
export const CreateMachineCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await MachineCategory.findOne({ category: key.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new MachineCategory({
        category: key,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json({ message: "success" })

}

export const UpdateMachineCategory = async (req: Request, res: Response, next: NextFunction) => {
    const { key } = req.body as CreateOrEditDropDownDto
    if (!key) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldtype = await MachineCategory.findById(id)
    if (!oldtype)
        return res.status(404).json({ message: "category not found" })
    if (key !== oldtype.category)
        if (await MachineCategory.findOne({ category: key.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    let prevtype = oldtype.category
    oldtype.category = key
    oldtype.updated_at = new Date()
    if (req.user)
        oldtype.updated_by = req.user
    await Machine.updateMany({ category: prevtype }, { category: key })
    await oldtype.save()
    return res.status(200).json({ message: "updated" })

}
export const DeleteMachineCategory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await MachineCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
}
export const GetMachines = async (req: Request, res: Response, next: NextFunction) => {
    let hidden = String(req.query.hidden)
    let machines: IMachine[] = []
    let result: GetMachineDto[] = []
    if (hidden === "true") {
        machines = await Machine.find({ active: false }).populate('created_by').populate('updated_by').sort('serial_no')
    } else
        machines = await Machine.find({ active: true }).populate('created_by').populate('updated_by').sort('serial_no')
    result = machines.map((m) => {
        return {
            _id: m._id,
            name: m.name,
            active: m.active,
            category: m.category,
            serial_no: m.serial_no,
            display_name: m.display_name,
            created_at: m.created_at && moment(m.created_at).format("DD/MM/YYYY"),
            updated_at: m.updated_at && moment(m.updated_at).format("DD/MM/YYYY"),
            created_by: { id: m.created_by._id, value: m.created_by.username, label: m.created_by.username },
            updated_by: { id: m.updated_by._id, value: m.updated_by.username, label: m.updated_by.username }
        }
    })
    return res.status(200).json(result)
}
export const CreateMachine = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name, category, serial_no } = req.body as CreateOrEditMachineDto
    if (!name || !display_name || !category || !serial_no) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Machine.findOne({ name: name }))
        return res.status(400).json({ message: "already exists this machine" })
    let machine = await new Machine({
        name: name, display_name: display_name, category: category,
        serial_no: serial_no,
        created_at: new Date(),
        updated_by: req.user,
        updated_at: new Date(),
        created_by: req.user,
    }).save()

    return res.status(201).json(machine)
}
export const UpdateMachine = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name, category, serial_no } = req.body as CreateOrEditMachineDto
    if (!name || !display_name || !category || !serial_no) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let machine = await Machine.findById(id)
    if (!machine)
        return res.status(404).json({ message: "machine not found" })
    if (name !== machine.name)
        if (await Machine.findOne({ name: name }))
            return res.status(400).json({ message: "already exists this machine" })
    machine.name = name
    machine.display_name = display_name
    machine.serial_no = serial_no
    machine.category = category
    machine.updated_at = new Date()
    if (req.user)
        machine.updated_by = req.user
    await machine.save()
    return res.status(200).json(machine)
}
export const BulkUploadMachine = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: CreateOrEditMachineDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        console.log(workbook_response)
        let newMachines: { name: string, display_name: string, category: string, serial_no: number, }[] = []
        workbook_response.forEach(async (machine) => {
            let name: string | null = machine.name
            let display_name: string | null = machine.display_name
            let category: string | null = machine.category
            let serial_no: number | null = machine.serial_no
            console.log(display_name, name)
            newMachines.push({ name: name, display_name: display_name, category: category, serial_no: machine.serial_no, })
        })
        console.log(newMachines)
        newMachines.forEach(async (mac) => {
            let machine = await Machine.findOne({ name: mac.name })
            if (!machine)
                await new Machine({ name: mac.name, display_name: mac.display_name, category: mac.category, serial_no: mac.serial_no, created_by: req.user, updated_by: req.user }).save()
        })
    }
    return res.status(200).json({ message: "machines updated" });
}   

export const ToogleMachine = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let machine = await Machine.findById(id)
    if (!machine)
        return res.status(404).json({ message: "machine not found" })
    machine.active = !machine.active
    machine.updated_at = new Date()
    if (req.user)
        machine.updated_by = req.user
    await machine.save()
    return res.status(200).json(machine)

}
export const GetArticles = async (req: Request, res: Response, next: NextFunction) => {
    let hidden = String(req.query.hidden)
    let result: GetArticleDto[] = []
    let articles: IArticle[] = []
    if (hidden === "true") {
        articles = await Article.find({ active: false }).populate('created_by').populate('updated_by').sort('name')
    } else
        articles = await Article.find({ active: true }).populate('created_by').populate('updated_by').sort('name')
    result = articles.map((m) => {
        return {
            _id: m._id,
            name: m.name,
            display_name: m.display_name,
            active: m.active,
            created_at: m.created_at && moment(m.created_at).format("DD/MM/YYYY"),
            updated_at: m.updated_at && moment(m.updated_at).format("DD/MM/YYYY"),
            created_by: { id: m.created_by._id, value: m.created_by.username, label: m.created_by.username },
            updated_by: { id: m.updated_by._id, value: m.updated_by.username, label: m.updated_by.username }
        }
    })
    return res.status(200).json(result)
}
export const BulkUploadArticle = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: CreateOrEditArticleDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        console.log(workbook_response)
        let newArticles: CreateOrEditArticleDto[] = []
        workbook_response.forEach(async (article) => {
            let name: string | null = article.name
            let display_name: string | null = article.display_name
            console.log(display_name, name)
            newArticles.push({ name: name, display_name: display_name })
        })
        console.log(newArticles)
        newArticles.forEach(async (mac) => {
            let article = await Article.findOne({ display_name: mac.display_name })
            if (!article)
                await new Article({ name: mac.name, display_name: mac.display_name, created_by: req.user, updated_by: req.user }).save()
        })
    }
    return res.status(200).json({ message: "articles updated" });
}

export const CreateArticle = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditArticleDto
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Article.findOne({ name: name }))
        return res.status(400).json({ message: "already exists this article" })
    let machine = await new Article({
        name: name, display_name: display_name,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()

    return res.status(201).json(machine)

}

export const UpdateArticle = async (req: Request, res: Response, next: NextFunction) => {
    const { name, display_name } = req.body as CreateOrEditArticleDto
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let article = await Article.findById(id)
    if (!article)
        return res.status(404).json({ message: "article not found" })
    if (name !== article.name)
        if (await Article.findOne({ name: name }))
            return res.status(400).json({ message: "already exists this article" })
    article.name = name
    article.display_name = display_name
    article.updated_at = new Date()
    if (req.user)
        article.updated_by = req.user
    await article.save()
    return res.status(200).json(article)

}
export const ToogleArticle = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let article = await Article.findById(id)
    if (!article)
        return res.status(404).json({ message: "article not found" })
    article.active = !article.active
    article.updated_at = new Date()
    if (req.user)
        article.updated_by = req.user
    await article.save()
    return res.status(200).json(article)

}

export const GetDyeById = async (req: Request, res: Response, next: NextFunction) => {
    let id = req.params.id;

    let dye = await Dye.findById(id).populate('articles');
    if (!dye)
        return res.status(404).json({ message: "dye not exists" })
    let result: GetDyeDto = {
        _id: dye._id,
        active: dye.active,
        dye_number: dye.dye_number,
        size: dye.size,
        articles: dye.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
        stdshoe_weight: dye.stdshoe_weight,
        created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
        updated_at: dye.updated_at && moment(dye.updated_at).format("DD/MM/YYYY"),
        created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
        updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
    }
    return res.status(200).json(result)
}

export const GetDyes = async (req: Request, res: Response, next: NextFunction) => {
    let hidden = String(req.query.hidden)
    let dyes: IDye[] = []
    let result: GetDyeDto[] = []
    if (hidden === "true") {
        dyes = await Dye.find({ active: false }).populate('articles').populate('created_by').populate('updated_by').sort('dye_number')
    } else
        dyes = await Dye.find({ active: true }).populate('articles').populate('created_by').populate('updated_by').sort('dye_number')
    result = dyes.map((dye) => {
        return {
            _id: dye._id,
            active: dye.active,
            dye_number: dye.dye_number,
            size: dye.size,
            articles: dye.articles.map((a) => { return { id: a._id, value: a.name, label: a.name } }),
            stdshoe_weight: dye.stdshoe_weight,
            created_at: dye.created_at && moment(dye.created_at).format("DD/MM/YYYY"),
            updated_at: dye.updated_at && moment(dye.updated_at).format("DD/MM/YYYY"),
            created_by: { id: dye.created_by._id, value: dye.created_by.username, label: dye.created_by.username },
            updated_by: { id: dye.updated_by._id, value: dye.updated_by.username, label: dye.updated_by.username }
        }
    })
    return res.status(200).json(result)
}
export const BulkUploadDye = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file)
        return res.status(400).json({
            message: "please provide an Excel file",
        });
    if (req.file) {
        const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
        if (req.file.size > 100 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
        const workbook = xlsx.read(req.file.buffer);
        let workbook_sheet = workbook.SheetNames;
        let workbook_response: CreateOrEditDyeDtoFromExcel[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        let newDyes: { dye_number: number, size: string, articles: IArticle[], st_weight: number }[] = []

        for (let i = 0; i < workbook_response.length; i++) {
            let dye_number: number | null = workbook_response[i].dye_number
            let size: string | null = workbook_response[i].size
            let articles: string[] | null = workbook_response[i].articles && workbook_response[i].articles.split(",") || []
            let st_weight: number | null = workbook_response[i].st_weight
            let newArticles: IArticle[] = []
            if (articles && articles.length > 0) {
                for (let j = 0; j < articles.length; j++) {
                    let art = await Article.findOne({ name: articles[j].toLowerCase().trim() })
                    if (art) {
                        newArticles.push(art)
                    }
                }
            }

            newDyes.push({ dye_number: dye_number, size: size, articles: newArticles, st_weight: st_weight })
        }


        for (let i = 0; i < newDyes.length; i++) {
            let mac = newDyes[i];
            let dye = await Dye.findOne({ dye_number: mac.dye_number })
            if (!dye) {
                await new Dye({ dye_number: mac.dye_number, size: mac.size, articles: newDyes[i].articles, stdshoe_weight: mac.st_weight, created_by: req.user, updated_by: req.user }).save()
            }
            else {
                await Dye.findByIdAndUpdate(dye._id, {
                    dye_number: mac.dye_number, size: mac.size, articles: newDyes[i].articles, stdshoe_weight: mac.st_weight, created_by: req.user, updated_by: req.user
                })
            }
        }

    }
    return res.status(200).json({ message: "dyes updated" });
}
export const CreateDye = async (req: Request, res: Response, next: NextFunction) => {
    const { dye_number, size, articles, st_weight } = req.body as CreateOrEditDyeDTo
    if (!dye_number || !size) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Dye.findOne({ dye_number: dye_number }))
        return res.status(400).json({ message: "already exists this dye" })

    let dye = await new Dye({
        dye_number: dye_number, size: size,
        articles: articles,
        stdshoe_weight: st_weight,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(dye)
}
export const UpdateDye = async (req: Request, res: Response, next: NextFunction) => {
    const { dye_number, size, articles, st_weight } = req.body as CreateOrEditDyeDTo
    if (!dye_number || !size) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }

    const id = req.params.id
    let dye = await Dye.findById(id)
    if (!dye)
        return res.status(404).json({ message: "dye not found" })
    if (dye_number !== dye.dye_number)
        if (await Dye.findOne({ dye_number: dye_number }))
            return res.status(400).json({ message: "already exists this dye" })


    dye.dye_number = dye_number
    dye.size = size
    //@ts-ignore
    dye.articles = articles
    dye.stdshoe_weight = st_weight,
        dye.updated_at = new Date()
    if (req.user)
        dye.updated_by = req.user
    await dye.save()
    return res.status(200).json(dye)
}

export const ToogleDye = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let dye = await Dye.findById(id)
    if (!dye)
        return res.status(404).json({ message: "dye not found" })
    dye.active = !dye.active
    dye.updated_at = new Date()
    if (req.user)
        dye.updated_by = req.user
    await dye.save()
    return res.status(200).json(dye)
}


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