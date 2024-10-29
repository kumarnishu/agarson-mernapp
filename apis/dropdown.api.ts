import { NextFunction, Request, Response } from "express"
import { AssignOrRemoveCrmCityDto, AssignOrRemoveCrmStateDto, CreateAndUpdatesCityFromExcelDto, CreateAndUpdatesStateFromExcelDto, CreateOrEditCrmCity,  CreateOrEditDyeDTo,  CreateOrEditDyeDtoFromExcel,  CreateOrEditErpStateDto, CreateOrEditMachineDto, DropDownDto, GetArticleDto, GetCrmCityDto, GetCrmStateDto, GetDyeDto, GetDyeLocationDto, GetErpEmployeeDto, GetErpStateDto, GetMachineDto } from "../dtos/dropdown.dto"
import xlsx from "xlsx"
import moment from "moment"
import { Article, ChecklistCategory, CRMCity, CRMState, Dye, DyeLocation, ErpEmployee, LeadSource, LeadType, Machine, MachineCategory, MaintenanceCategory, Stage, State } from "../models/dropdown.model"
import Lead, { ReferredParty, User } from "../models/feature.model"
import isMongoId from "validator/lib/isMongoId"
import { HandleCRMCitiesAssignment } from "../utils/app.util"
import { IArticle, ICRMCity, ICRMState, IDye, IDyeLocation, IMachine } from "../interfaces/dropdown.interface"
import mongoose from "mongoose"
import { isAuthenticatedUser } from "../middlewares/auth.middleware"

import express from "express";
const router = express.Router()

router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let types = await LeadType.find()
    result = types.map((t) => {
        return { id: t._id, value: t.type, label: t.type }
    })
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body as {type:string}
    if (!type) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await LeadType.findOne({ type: type.toLowerCase() }))
        return res.status(400).json({ message: "already exists this type" })
    let result = await new LeadType({
        type: type,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json({ message: "success" })

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { type } = req.body as { type: string }
    if (!type) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldtype = await LeadType.findById(id)
    if (!oldtype)
        return res.status(404).json({ message: "type not found" })
    if (type !== oldtype.type)
        if (await LeadType.findOne({ type: type.toLowerCase() }))
            return res.status(400).json({ message: "already exists this type" })
    let prevtype = oldtype.type
    oldtype.type = type
    oldtype.updated_at = new Date()
    if (req.user)
        oldtype.updated_by = req.user
    await Lead.updateMany({ type: prevtype }, { type: type })
    await ReferredParty.updateMany({ type: prevtype }, { type: type })
    await oldtype.save()
    return res.status(200).json({ message: "updated" })

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "type id not valid" })
    let type = await LeadType.findById(id);
    if (!type) {
        return res.status(404).json({ message: "type not found" })
    }
    await type.remove();
    return res.status(200).json({ message: "lead type deleted successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let sources = await LeadSource.find()
    result = sources.map((i) => {
        return { id: i._id, value: i.source, label: i.source }
    })
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { source } = req.body as {source:string}
    if (!source) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await LeadSource.findOne({ source: source.toLowerCase() }))
        return res.status(400).json({ message: "already exists this source" })
    let result = await new LeadSource({
        source: source,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { source } = req.body as {source:string}
    if (!source) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldsource = await LeadSource.findById(id)
    if (!oldsource)
        return res.status(404).json({ message: "source not found" })
    if (source !== oldsource.source)
        if (await LeadSource.findOne({ source: source.toLowerCase() }))
            return res.status(400).json({ message: "already exists this source" })
    let prevsource = oldsource.source
    oldsource.source = source
    oldsource.updated_at = new Date()
    if (req.user)
        oldsource.updated_by = req.user
    await Lead.updateMany({ source: prevsource }, { source: source })
    await ReferredParty.updateMany({ source: prevsource }, { source: source })
    await oldsource.save()
    return res.status(200).json(oldsource)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "source id not valid" })
    let source = await LeadSource.findById(id);
    if (!source) {
        return res.status(404).json({ message: "source not found" })
    }
    await source.remove();
    return res.status(200).json({ message: "lead source deleted successfully" })
})
//lead stages
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let stages: DropDownDto[] = []
    stages = await (await Stage.find()).map((i) => { return { id: i._id, label: i.stage, value: i.stage } });
    return res.status(200).json(stages)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { stage } = req.body as {stage:string}
    if (!stage) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Stage.findOne({ stage: stage.toLowerCase() }))
        return res.status(400).json({ message: "already exists this stage" })
    let result = await new Stage({
        stage: stage,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { stage } = req.body as {stage:string}

    if (!stage) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldstage = await Stage.findById(id)
    if (!oldstage)
        return res.status(404).json({ message: "stage not found" })
    if (stage !== oldstage.stage)
        if (await Stage.findOne({ stage: stage.toLowerCase() }))
            return res.status(400).json({ message: "already exists this stage" })
    let prevstage = oldstage.stage
    oldstage.stage = stage
    oldstage.updated_at = new Date()
    if (req.user)
        oldstage.updated_by = req.user
    await Lead.updateMany({ stage: prevstage }, { stage: stage })
    await ReferredParty.updateMany({ stage: prevstage }, { stage: stage })
    await oldstage.save()
    return res.status(200).json(oldstage)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "stage id not valid" })
    let stage = await Stage.findById(id);
    if (!stage) {
        return res.status(404).json({ message: "stage not found" })
    }
    await stage.remove();
    return res.status(200).json({ message: "lead stage deleted successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let result: GetCrmStateDto[] = []
    let states = await CRMState.find()

    for (let i = 0; i < states.length; i++) {
        let users = await (await User.find({ assigned_crm_states: states[i]._id })).map((i) => { return { _id: i._id.valueOf(), username: i.username } })
        result.push({ _id: states[i]._id, state: states[i].state, assigned_users: String(users.map((u) => { return u.username })) });
    }
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { state } = req.body as {state:string}
    if (!state) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await CRMState.findOne({ state: state.toLowerCase() }))
        return res.status(400).json({ message: "already exists this state" })
    let result = await new CRMState({
        state: state,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { state } = req.body as { state: string }
    if (!state) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldstate = await CRMState.findById(id)
    if (!oldstate)
        return res.status(404).json({ message: "state not found" })
    if (state !== oldstate.state)
        if (await CRMState.findOne({ state: state.toLowerCase() }))
            return res.status(400).json({ message: "already exists this state" })
    let prevstate = oldstate.state
    oldstate.state = state
    oldstate.updated_at = new Date()
    if (req.user)
        oldstate.updated_by = req.user

    await Lead.updateMany({ state: prevstate }, { state: state })
    await ReferredParty.updateMany({ state: prevstate }, { state: state })

    await oldstate.save()
    return res.status(200).json(oldstate)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "state id not valid" })
    let state = await CRMState.findById(id);
    if (!state) {
        return res.status(404).json({ message: "state not found" })
    }

    await state.remove();
    return res.status(200).json({ message: "state deleted successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { city_ids, user_ids, flag } = req.body as AssignOrRemoveCrmCityDto

    if (city_ids && city_ids.length === 0)
        return res.status(400).json({ message: "please select one city " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one city owner" })
    await HandleCRMCitiesAssignment(user_ids, city_ids, flag);
    return res.status(200).json({ message: "successfull" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
)
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
//cities)
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let states = await CRMState.find({ state: { $ne: "" } });
    let statevalues = states.map(i => { return i.state });
    await Lead.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
    await ReferredParty.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
    return res.status(200).json({ message: "successfull" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let stages = await Stage.find({ stage: { $ne: "" } });
    let stagevalues = stages.map(i => { return i.stage });
    await Lead.updateMany({ stage: { $nin: stagevalues } }, { stage: 'unknown' });
    return res.status(200).json({ message: "successfull" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let cities = await CRMCity.find({ city: { $ne: "" } });
    let cityvalues = cities.map(i => { return i.city });

    await CRMCity.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    await Lead.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    await ReferredParty.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
    return res.status(200).json({ message: "successfull" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let result = await ChecklistCategory.find();
    let data: DropDownDto[];
    data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(data)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body as {category:string}
    if (!category) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ChecklistCategory.findOne({ category: category.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new ChecklistCategory({
        category: category,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body as {
        category: string,
    }
    if (!category) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await ChecklistCategory.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "category not found" })
    console.log(category, oldlocation.category)
    if (category !== oldlocation.category)
        if (await ChecklistCategory.findOne({ category: category.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    oldlocation.category = category
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await ChecklistCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "state id not valid" })
    let state = await State.findById(id);
    if (!state) {
        return res.status(404).json({ message: "state not found" })
    }
    await state.remove();
    return res.status(200).json({ message: "state deleted successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let result: GetErpEmployeeDto[] = []
    let employees = await ErpEmployee.find()
    for (let i = 0; i < employees.length; i++) {
        let users = await User.find({ assigned_erpEmployees: employees[i]._id })
        result.push({
            _id: employees[i]._id,
            name: employees[i].name,
            created_at: moment(employees[i].created_at).format("DD/MM/YYYY"),
            updated_at: moment(employees[i].updated_at).format("DD/MM/YYYY"),
            created_by: employees[i].created_by.username,
            updated_by: employees[i].updated_by.username,
            assigned_employees: users.map((u) => { return u.username }).toString()
        })
    }
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body as {name:string};
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await ErpEmployee.findOne({ name: name }))
        return res.status(400).json({ message: "already exists this employee" })
    let result = await new ErpEmployee({
        name,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body as {name:string};
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
    await ErpEmployee.findByIdAndUpdate(emp._id, { name,  updated_by: req.user, updated_at: new Date() })
    return res.status(200).json(emp)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "employee id not valid" })
    let employee = await ErpEmployee.findById(id);
    if (!employee) {
        return res.status(404).json({ message: "employee not found" })
    }
    await employee.remove();
    return res.status(200).json({ message: "employee deleted successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let result = await MaintenanceCategory.find();
    let data: DropDownDto[];
    data = result.map((r) => { return { id: r._id, label: r.category, value: r.category } });
    return res.status(200).json(data)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body as {category:string}
    if (!category) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await MaintenanceCategory.findOne({ category: category.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new MaintenanceCategory({
        category: category,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body as {
        category: string,
    }
    if (!category) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldlocation = await MaintenanceCategory.findById(id)
    if (!oldlocation)
        return res.status(404).json({ message: "category not found" })
    console.log(category, oldlocation.category)
    if (category !== oldlocation.category)
        if (await MaintenanceCategory.findOne({ category: category.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    oldlocation.category = category
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await MaintenanceCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    category.active = !category.active;
    await category.save();
    return res.status(200).json({ message: "category status changed successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    let result = (await MachineCategory.find()).map((c) => {
        return { id: c._id, label: c.category, value: c.category }
    })
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body as {category:string}
    if (!category) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await MachineCategory.findOne({ category: category.toLowerCase() }))
        return res.status(400).json({ message: "already exists this category" })
    let result = await new MachineCategory({
        category: category,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json({ message: "success" })

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { category } = req.body as { category :string}
    if (!category) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    const id = req.params.id
    let oldtype = await MachineCategory.findById(id)
    if (!oldtype)
        return res.status(404).json({ message: "category not found" })
    if (category !== oldtype.category)
        if (await MachineCategory.findOne({ category: category.toLowerCase() }))
            return res.status(400).json({ message: "already exists this category" })
    let prevtype = oldtype.category
    oldtype.category = category
    oldtype.updated_at = new Date()
    if (req.user)
        oldtype.updated_by = req.user
    await Machine.updateMany({ category: prevtype }, { category: category })
    await oldtype.save()
    return res.status(200).json({ message: "updated" })

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
    let category = await MachineCategory.findById(id);
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }
    await category.remove();
    return res.status(200).json({ message: "category deleted successfully" })
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
            created_at: m.created_at && moment(m.created_at).format("DD/MM/YYYY"),
            updated_at: m.updated_at && moment(m.updated_at).format("DD/MM/YYYY"),
            created_by: { id: m.created_by._id, value: m.created_by.username, label: m.created_by.username },
            updated_by: { id: m.updated_by._id, value: m.updated_by.username, label: m.updated_by.username }
        }
    })
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name,  category, serial_no } = req.body as CreateOrEditMachineDto
    if (!name  || !category || !serial_no) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Machine.findOne({ name: name }))
        return res.status(400).json({ message: "already exists this machine" })
    let machine = await new Machine({
        name: name, category: category,
        serial_no: serial_no,
        created_at: new Date(),
        updated_by: req.user,
        updated_at: new Date(),
        created_by: req.user,
    }).save()

    return res.status(201).json(machine)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name,  category, serial_no } = req.body as CreateOrEditMachineDto
    if (!name || !category || !serial_no) {
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
    machine.serial_no = serial_no
    machine.category = category
    machine.updated_at = new Date()
    if (req.user)
        machine.updated_by = req.user
    await machine.save()
    return res.status(200).json(machine)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
        let newMachines: { name: string, category: string, serial_no: number, }[] = []
        workbook_response.forEach(async (machine) => {
            let name: string | null = machine.name
            let category: string | null = machine.category
            let serial_no: number | null = machine.serial_no
            newMachines.push({ name: name, category: category, serial_no: machine.serial_no, })
        })
        newMachines.forEach(async (mac) => {
            let machine = await Machine.findOne({ name: mac.name })
            if (!machine)
                await new Machine({ name: mac.name, category: mac.category, serial_no: mac.serial_no, created_by: req.user, updated_by: req.user }).save()
        })
    }
    return res.status(200).json({ message: "machines updated" });
}   )
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
            active: m.active,
            created_at: m.created_at && moment(m.created_at).format("DD/MM/YYYY"),
            updated_at: m.updated_at && moment(m.updated_at).format("DD/MM/YYYY"),
            created_by: { id: m.created_by._id, value: m.created_by.username, label: m.created_by.username },
            updated_by: { id: m.updated_by._id, value: m.updated_by.username, label: m.updated_by.username }
        }
    })
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
        let workbook_response: {name:string}[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        console.log(workbook_response)
        let newArticles: {name:string}[] = []
        workbook_response.forEach(async (article) => {
            let name: string | null = article.name
            newArticles.push({ name: name })
        })
        newArticles.forEach(async (mac) => {
            let article = await Article.findOne({ name: mac.name })
            if (!article)
                await new Article({ name: mac.name, created_by: req.user, updated_by: req.user }).save()
        })
    }
    return res.status(200).json({ message: "articles updated" });
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body as {name:string}
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await Article.findOne({ name: name }))
        return res.status(400).json({ message: "already exists this article" })
    let machine = await new Article({
        name: name, 
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()

    return res.status(201).json(machine)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body as {name:string}
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
    article.updated_at = new Date()
    if (req.user)
        article.updated_by = req.user
    await article.save()
    return res.status(200).json(article)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
            created_at: l.created_at && moment(l.created_at).format("DD/MM/YYYY"),
            updated_at: l.updated_at && moment(l.updated_at).format("DD/MM/YYYY"),
            created_by: { id: l.created_by._id, value: l.created_by.username, label: l.created_by.username },
            updated_by: { id: l.updated_by._id, value: l.updated_by.username, label: l.updated_by.username }
        }
    })
    return res.status(200).json(result)
})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body as {name:string}
    if (!name) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await DyeLocation.findOne({ name: name.toLowerCase() }))
        return res.status(400).json({ message: "already exists this dye location" })
    let result = await new DyeLocation({
        name: name,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body as {name:string}
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
    oldlocation.updated_at = new Date()
    if (req.user)
        oldlocation.updated_by = req.user
    await oldlocation.save()
    return res.status(200).json(oldlocation)

})
router.get("/",isAuthenticatedUser,async (req: Request, res: Response, next: NextFunction) => {
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
})

export default router;