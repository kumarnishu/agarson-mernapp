import { NextFunction, Request, Response } from "express"
import isMongoId from "validator/lib/isMongoId"
import xlsx from "xlsx"
import Lead, { ILead } from "../models/leads/lead.model.js"
import { Asset, IUser, User } from "../models/users/user.model.js"
import { IRemark, Remark } from "../models/leads/remark.model.js"
import { uploadFileToCloud } from "../utils/uploadFile.util.js"
import { Types } from "mongoose"
import { destroyFile } from "../utils/destroyFile.util.js"
import { IReferredParty, ReferredParty } from "../models/leads/referred.model.js"
import { CRMState, ICRMState } from "../models/leads/crm.state.model.js"
import { SaveLeadMobilesToExcel, SaveLeadsToExcel } from "../utils/ExportToExcel.js"
import { CRMCity, ICRMCity } from "../models/leads/crm.city.model.js"
import { LeadType } from "../models/leads/crm.leadtype.model.js"
import { LeadSource } from "../models/leads/crm.source.model.js"
import { IStage, Stage } from "../models/leads/crm.stage.model.js"
import { HandleCRMCitiesAssignment } from "../utils/AssignCitiesToUsers.js"
import { AssignOrRemoveCrmCityDto, AssignOrRemoveCrmStateDto, CreateAndUpdatesCityFromExcelDto, CreateAndUpdatesLeadFromExcelDto, CreateAndUpdatesStateFromExcelDto, CreateOrEditBillDto, CreateOrEditCrmCity, CreateOrEditLeadDto, CreateOrEditMergeLeadsDto, CreateOrEditMergeRefersDto, CreateOrEditReferDto, CreateOrEditReferFromExcelDto, CreateOrEditRemarkDto, CreateOrRemoveReferForLeadDto, GetActivitiesOrRemindersDto, GetActivitiesTopBarDetailsDto, GetBillDto, GetCrmCityDto, GetCrmStateDto, GetLeadDto, GetReferDto, GetRemarksDto } from "../dtos/crm/crm.dto.js"
import moment from "moment"
import { CreateOrEditDropDownDto, DropDownDto } from "../dtos/common/dropdown.dto.js"
import { Bill, IBill } from "../models/leads/bill.model.js"
import { BillItem } from "../models/leads/bill.item.js"



//lead types
export const GetAllCRMLeadTypes = async (req: Request, res: Response, next: NextFunction) => {
    let result: DropDownDto[] = []
    let types = await LeadType.find()
    result = types.map((t) => {
        return { id: t._id, value: t.type, label: t.type }
    })
    return res.status(200).json(result)
}

export const MergeTwoLeads = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { name, mobiles, city, stage, state, email, alternate_email, address, merge_refer, merge_bills, merge_remarks, source_lead_id } = req.body as CreateOrEditMergeLeadsDto
    let lead = await Lead.findById(id);
    let sourcelead = await Lead.findById(source_lead_id);

    if (!lead || !sourcelead)
        return res.status(404).json({ message: "leads not found" })

    await Lead.findByIdAndUpdate(id, {
        name: name,
        city: city,
        state: state,
        mobile: mobiles[0] || null,
        alternate_mobile1: mobiles[1] || null,
        alternate_mobile2: mobiles[2] || null,
        stage: stage,
        email: email,
        alternate_email: alternate_email,
        address: address
    });

    if (merge_refer) {
        let refer = await ReferredParty.findById(sourcelead.referred_party);
        if (refer) {
            lead.referred_party = refer;
            lead.referred_date = sourcelead.referred_date;
            await lead.save();
        }
    }
    if (merge_remarks) {
        await Remark.updateMany({ lead: source_lead_id }, { lead: id });
    }
    if (merge_bills) {
        await Bill.updateMany({ lead: source_lead_id }, { lead: id });
    }
    await Lead.findByIdAndDelete(source_lead_id);
    return res.status(200).json({ message: "merge leads successfully" })
}
export const MergeTwoRefers = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const { name, mobiles, city, state, address, merge_assigned_refers, merge_bills, merge_remarks, source_refer_id } = req.body as CreateOrEditMergeRefersDto
    let refer = await ReferredParty.findById(id);
    let sourcerefer = await ReferredParty.findById(source_refer_id);

    if (!refer || !sourcerefer)
        return res.status(404).json({ message: "refers not found" })

    await ReferredParty.findByIdAndUpdate(id, {
        name: name,
        city: city,
        state: state,
        mobile: mobiles[0] || null,
        mobile2: mobiles[1] || null,
        mobile3: mobiles[2] || null,
        address: address
    });

    if (merge_assigned_refers) {
        await Lead.updateMany({ referred_party: source_refer_id }, { referred_party: id });
    }
    if (merge_remarks) {
        await Remark.updateMany({ refer: source_refer_id }, { refer: id });
    }
    if (merge_bills) {
        await Bill.updateMany({ refer: source_refer_id }, { refer: id });
    }
    await ReferredParty.findByIdAndDelete(source_refer_id);
    return res.status(200).json({ message: "merge refers successfully" })
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


//source types
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


//states apis
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

export const GetAssignedReferrals = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let party = await ReferredParty.findById(id)

    if (!party)
        return res.status(404).json({ message: "party not found" })
    let leads: ILead[]
    let result: GetLeadDto[] = []
    leads = await Lead.find({ referred_party: party._id }).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')


    result = leads.map((lead) => {
        return {
            _id: lead._id,
            name: lead.name,
            customer_name: lead.customer_name,
            uploaded_bills: lead.uploaded_bills,
            customer_designation: lead.customer_designation,
            mobile: lead.mobile,
            gst: lead.gst,
            has_card: lead.has_card,
            email: lead.email,
            city: lead.city,
            state: lead.state,
            country: lead.country,
            address: lead.address,
            work_description: lead.work_description,
            turnover: lead.turnover,
            alternate_mobile1: lead.alternate_mobile1,
            alternate_mobile2: lead.alternate_mobile2,
            alternate_email: lead.alternate_email,
            lead_type: lead.lead_type,
            stage: lead.stage,
            lead_source: lead.lead_source,
            visiting_card: lead.visiting_card?.public_url || "",
            referred_party_name: lead.referred_party && lead.referred_party.name,
            referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
            referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
            last_remark: lead?.last_remark || "",
            created_at: moment(lead.created_at).format("DD/MM/YYYY"),
            updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
            created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
            updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
        }
    })

    return res.status(200).json(result);
}

// leads apis
export const GetLeads = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let stage = req.query.stage
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let showonlycardleads = Boolean(user?.show_only_visiting_card_leads)
    let result: GetLeadDto[] = []
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let stages = await (await Stage.find()).map((i) => { return i.stage })
    if (!req.user?.assigned_permissions.includes('show_leads_useless'))
        stages = stages.filter((stage) => { return stage !== "useless" })
    if (!req.user?.assigned_permissions.includes('show_refer_leads'))
        stages = stages.filter((stage) => { return stage !== "refer" })
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        let leads: ILead[] = []
        let count = 0
        if (stage != "all") {
            leads = await Lead.find({
                stage: stage, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                stage: stage, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }
        else if (showonlycardleads) {
            leads = await Lead.find({
                has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                has_card: showonlycardleads, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }
        else {
            leads = await Lead.find({
                stage: { $in: stages }, state: { $in: states }, city: { $in: cities }
            }).populate('updated_by').populate('referred_party').populate('created_by').sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Lead.find({
                stage: { $in: stages }, state: { $in: states }, city: { $in: cities }
            }).countDocuments()
        }

        result = leads.map((lead) => {
            return {
                _id: lead._id,
                name: lead.name,
                customer_name: lead.customer_name,
                customer_designation: lead.customer_designation,
                mobile: lead.mobile,
                gst: lead.gst,
                has_card: lead.has_card,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                uploaded_bills: lead.uploaded_bills || 0,
                country: lead.country,
                address: lead.address,
                work_description: lead.work_description,
                turnover: lead.turnover,
                alternate_mobile1: lead.alternate_mobile1,
                alternate_mobile2: lead.alternate_mobile2,
                alternate_email: lead.alternate_email,
                lead_type: lead.lead_type,
                stage: lead.stage,
                lead_source: lead.lead_source,
                visiting_card: lead.visiting_card?.public_url || "",
                referred_party_name: lead.referred_party && lead.referred_party.name,
                referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                last_remark: lead.last_remark || "",
                created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
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
export const ReferLead = async (req: Request, res: Response, next: NextFunction) => {
    const { party_id, remark, remind_date } = req.body as CreateOrRemoveReferForLeadDto
    if (!party_id)
        return res.status(400).json({ message: "fill required field" })
    const id = req.params.id
    if (!isMongoId(id) || !isMongoId(party_id))
        return res.status(400).json({ message: "bad mongo id" })
    let lead = await Lead.findById(id)
    if (!lead)
        return res.status(404).json({ message: "lead not found" })
    let party = await ReferredParty.findById(party_id)
    if (!party)
        return res.status(404).json({ message: "referred party not found" })

    if (remark) {
        let new_remark = new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        })
        if (remind_date)
            new_remark.remind_date = new Date(remind_date)
        await new_remark.save()
    }

    lead.referred_party = party
    lead.stage = "refer"
    lead.last_remark = remark;
    lead.referred_date = new Date()
    lead.updated_at = new Date()
    if (req.user)
        lead.updated_by = req.user
    await lead.save()
    return res.status(200).json({ message: "party referred successfully" })
}

export const RemoveLeadReferral = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { remark } = req.body as CreateOrRemoveReferForLeadDto
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let lead = await Lead.findById(id)
    if (!lead)
        return res.status(404).json({ message: "lead not found" })
    if (remark) {
        let new_remark = new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        })
        await new_remark.save()
    }
    lead.referred_party = undefined
    lead.referred_date = undefined
    lead.stage = "open"
    lead.last_remark = remark;
    lead.updated_at = new Date()
    if (req.user)
        lead.updated_by = req.user
    await lead.save()
    return res.status(200).json({ message: "referrals removed successfully" })
}


export const ConvertLeadToRefer = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    const { remark } = req.body
    let resultParty = await ReferredParty.findOne({ mobile: lead.mobile });
    if (resultParty) {
        return res.status(400).json({ message: "already exists this mobile number in refers" })
    }

    const refer = await new ReferredParty({
        name: lead.name, customer_name: lead.customer_name, city: lead.city, state: lead.state,
        mobile: lead.mobile,
        mobile2: lead.alternate_mobile1 || undefined,
        mobile3: lead.alternate_mobile2 || undefined,
        address: lead.address,
        gst: "erertyujhtyuiop",
        convertedfromlead: true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    })
    await Remark.updateMany({ lead: lead._id }, { lead: undefined, refer: refer._id });
    refer.last_remark = remark
    await refer.save()
    await Lead.findByIdAndDelete(lead._id);
    if (remark)
        await new Remark({
            remark: remark,
            refer: refer,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
    return res.status(200).json({ message: "new refer created" })
}


export const FuzzySearchLeads = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let result: GetLeadDto[] = []
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let showonlycardleads = Boolean(user?.show_only_visiting_card_leads)
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let key = String(req.query.key).split(",")
    let stage = req.query.stage
    if (!key)
        return res.status(500).json({ message: "bad request" })
    let leads: ILead[] = []
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {

        if (stage != "all") {
            if (key.length == 1 || key.length > 4) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $or: [
                        { name: { $regex: key[0], $options: 'i' } },
                        { customer_name: { $regex: key[0], $options: 'i' } },
                        { customer_designation: { $regex: key[0], $options: 'i' } },
                        { gst: { $regex: key[0], $options: 'i' } },
                        { mobile: { $regex: key[0], $options: 'i' } },
                        { email: { $regex: key[0], $options: 'i' } },
                        { country: { $regex: key[0], $options: 'i' } },
                        { address: { $regex: key[0], $options: 'i' } },
                        { work_description: { $regex: key[0], $options: 'i' } },
                        { turnover: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                        { alternate_email: { $regex: key[0], $options: 'i' } },
                        { lead_type: { $regex: key[0], $options: 'i' } },
                        { lead_source: { $regex: key[0], $options: 'i' } },
                        { last_remark: { $regex: key[0], $options: 'i' } },
                        { city: { $regex: key[0], $options: 'i' } },
                        { state: { $regex: key[0], $options: 'i' } },
                    ]

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')
            }
            if (key.length == 2) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },

                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 3) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },

                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },

                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 4) {

                leads = await Lead.find({
                    stage: stage, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { gst: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },

                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },

                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[3], $options: 'i' } },
                                { customer_name: { $regex: key[3], $options: 'i' } },
                                { customer_designation: { $regex: key[3], $options: 'i' } },
                                { mobile: { $regex: key[3], $options: 'i' } },
                                { email: { $regex: key[3], $options: 'i' } },
                                { country: { $regex: key[3], $options: 'i' } },
                                { address: { $regex: key[3], $options: 'i' } },
                                { work_description: { $regex: key[3], $options: 'i' } },
                                { turnover: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                { alternate_email: { $regex: key[3], $options: 'i' } },
                                { lead_type: { $regex: key[3], $options: 'i' } },

                                { lead_source: { $regex: key[3], $options: 'i' } },
                                { last_remark: { $regex: key[3], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
        }
        else if (showonlycardleads) {
            if (key.length == 1 || key.length > 4) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $or: [
                        { name: { $regex: key[0], $options: 'i' } },
                        { customer_name: { $regex: key[0], $options: 'i' } },
                        { customer_designation: { $regex: key[0], $options: 'i' } },
                        { mobile: { $regex: key[0], $options: 'i' } },
                        { email: { $regex: key[0], $options: 'i' } },
                        { country: { $regex: key[0], $options: 'i' } },
                        { address: { $regex: key[0], $options: 'i' } },
                        { work_description: { $regex: key[0], $options: 'i' } },
                        { turnover: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                        { alternate_email: { $regex: key[0], $options: 'i' } },
                        { lead_type: { $regex: key[0], $options: 'i' } },
                        { lead_source: { $regex: key[0], $options: 'i' } },
                        { last_remark: { $regex: key[0], $options: 'i' } },
                        { city: { $regex: key[0], $options: 'i' } },
                        { state: { $regex: key[0], $options: 'i' } },
                    ]

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 2) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 3) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 4) {

                leads = await Lead.find({
                    has_card: showonlycardleads, state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[3], $options: 'i' } },
                                { customer_name: { $regex: key[3], $options: 'i' } },
                                { customer_designation: { $regex: key[3], $options: 'i' } },
                                { mobile: { $regex: key[3], $options: 'i' } },
                                { email: { $regex: key[3], $options: 'i' } },
                                { country: { $regex: key[3], $options: 'i' } },
                                { address: { $regex: key[3], $options: 'i' } },
                                { work_description: { $regex: key[3], $options: 'i' } },
                                { turnover: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                { alternate_email: { $regex: key[3], $options: 'i' } },
                                { lead_type: { $regex: key[3], $options: 'i' } },
                                { lead_source: { $regex: key[3], $options: 'i' } },
                                { last_remark: { $regex: key[3], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
        }
        else {
            if (key.length == 1 || key.length > 4) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $or: [
                        { name: { $regex: key[0], $options: 'i' } },
                        { customer_name: { $regex: key[0], $options: 'i' } },
                        { customer_designation: { $regex: key[0], $options: 'i' } },
                        { mobile: { $regex: key[0], $options: 'i' } },
                        { email: { $regex: key[0], $options: 'i' } },
                        { country: { $regex: key[0], $options: 'i' } },
                        { address: { $regex: key[0], $options: 'i' } },
                        { work_description: { $regex: key[0], $options: 'i' } },
                        { turnover: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                        { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                        { alternate_email: { $regex: key[0], $options: 'i' } },
                        { lead_type: { $regex: key[0], $options: 'i' } },
                        { lead_source: { $regex: key[0], $options: 'i' } },
                        { last_remark: { $regex: key[0], $options: 'i' } },
                        { city: { $regex: key[0], $options: 'i' } },
                        { state: { $regex: key[0], $options: 'i' } },
                    ]

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 2) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 3) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }
            if (key.length == 4) {

                leads = await Lead.find({
                    state: { $in: states }, city: { $in: cities },
                    $and: [
                        {
                            $or: [
                                { name: { $regex: key[0], $options: 'i' } },
                                { customer_name: { $regex: key[0], $options: 'i' } },
                                { customer_designation: { $regex: key[0], $options: 'i' } },
                                { mobile: { $regex: key[0], $options: 'i' } },
                                { email: { $regex: key[0], $options: 'i' } },
                                { country: { $regex: key[0], $options: 'i' } },
                                { address: { $regex: key[0], $options: 'i' } },
                                { work_description: { $regex: key[0], $options: 'i' } },
                                { turnover: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[0], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[0], $options: 'i' } },
                                { alternate_email: { $regex: key[0], $options: 'i' } },
                                { lead_type: { $regex: key[0], $options: 'i' } },
                                { lead_source: { $regex: key[0], $options: 'i' } },
                                { last_remark: { $regex: key[0], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[1], $options: 'i' } },
                                { customer_name: { $regex: key[1], $options: 'i' } },
                                { customer_designation: { $regex: key[1], $options: 'i' } },
                                { mobile: { $regex: key[1], $options: 'i' } },
                                { email: { $regex: key[1], $options: 'i' } },
                                { country: { $regex: key[1], $options: 'i' } },
                                { address: { $regex: key[1], $options: 'i' } },
                                { work_description: { $regex: key[1], $options: 'i' } },
                                { turnover: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile1: { $regex: key[1], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[1], $options: 'i' } },
                                { alternate_email: { $regex: key[1], $options: 'i' } },
                                { lead_type: { $regex: key[1], $options: 'i' } },
                                { lead_source: { $regex: key[1], $options: 'i' } },
                                { last_remark: { $regex: key[1], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[2], $options: 'i' } },
                                { customer_name: { $regex: key[2], $options: 'i' } },
                                { customer_designation: { $regex: key[2], $options: 'i' } },
                                { mobile: { $regex: key[2], $options: 'i' } },
                                { email: { $regex: key[2], $options: 'i' } },
                                { country: { $regex: key[2], $options: 'i' } },
                                { address: { $regex: key[2], $options: 'i' } },
                                { work_description: { $regex: key[2], $options: 'i' } },
                                { turnover: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[2], $options: 'i' } },
                                { alternate_email: { $regex: key[2], $options: 'i' } },
                                { lead_type: { $regex: key[2], $options: 'i' } },
                                { lead_source: { $regex: key[2], $options: 'i' } },
                                { last_remark: { $regex: key[2], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        },
                        {
                            $or: [
                                { name: { $regex: key[3], $options: 'i' } },
                                { customer_name: { $regex: key[3], $options: 'i' } },
                                { customer_designation: { $regex: key[3], $options: 'i' } },
                                { mobile: { $regex: key[3], $options: 'i' } },
                                { email: { $regex: key[3], $options: 'i' } },
                                { country: { $regex: key[3], $options: 'i' } },
                                { address: { $regex: key[3], $options: 'i' } },
                                { work_description: { $regex: key[3], $options: 'i' } },
                                { turnover: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile3: { $regex: key[3], $options: 'i' } },
                                { alternate_mobile2: { $regex: key[3], $options: 'i' } },
                                { alternate_email: { $regex: key[3], $options: 'i' } },
                                { lead_type: { $regex: key[3], $options: 'i' } },
                                { lead_source: { $regex: key[3], $options: 'i' } },
                                { last_remark: { $regex: key[3], $options: 'i' } },
                                { city: { $regex: key[0], $options: 'i' } },
                                { state: { $regex: key[0], $options: 'i' } },
                            ]
                        }
                    ]
                    ,

                }
                ).populate('updated_by').populate('created_by').populate('referred_party').sort('-updated_at')

            }

        }

        let count = leads.length
        leads = leads.slice((page - 1) * limit, limit * page)

        result = leads.map((lead) => {
            return {
                _id: lead._id,
                name: lead.name,
                customer_name: lead.customer_name,
                customer_designation: lead.customer_designation,
                mobile: lead.mobile,
                gst: lead.gst,
                has_card: lead.has_card,
                email: lead.email,
                city: lead.city,
                state: lead.state,
                uploaded_bills: lead.uploaded_bills || 0,
                last_remark: lead.last_remark || "",
                country: lead.country,
                address: lead.address,
                work_description: lead.work_description,
                turnover: lead.turnover,
                alternate_mobile1: lead.alternate_mobile1,
                alternate_mobile2: lead.alternate_mobile2,
                alternate_email: lead.alternate_email,
                lead_type: lead.lead_type,
                stage: lead.stage,
                lead_source: lead.lead_source,
                visiting_card: lead.visiting_card?.public_url || "",
                referred_party_name: lead.referred_party && lead.referred_party.name,
                referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
                referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
                created_at: moment(lead.created_at).format("DD/MM/YYYY"),
                updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
                created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
                updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
            }
        })
        // for (let i = 0; i < leads.length; i++) {
        //     let lead = leads[i];
        //     let remark = await Remark.findOne({ lead: lead._id }).sort('-created_at');
        //     let bills = await Bill.find({ lead: lead._id }).countDocuments()
        //     result.push({
        //         _id: lead._id,
        //         name: lead.name,
        //         customer_name: lead.customer_name,
        //         customer_designation: lead.customer_designation,
        //         mobile: lead.mobile,
        //         gst: lead.gst,
        //         has_card: lead.has_card,
        //         email: lead.email,
        //         city: lead.city,
        //         state: lead.state,
        //         uploaded_bills: bills,
        //         country: lead.country,
        //         address: lead.address,
        //         work_description: lead.work_description,
        //         turnover: lead.turnover,
        //         alternate_mobile1: lead.alternate_mobile1,
        //         alternate_mobile2: lead.alternate_mobile2,
        //         alternate_email: lead.alternate_email,
        //         lead_type: lead.lead_type,
        //         stage: lead.stage,
        //         lead_source: lead.lead_source,
        //         visiting_card: lead.visiting_card?.public_url || "",
        //         referred_party_name: lead.referred_party && lead.referred_party.name,
        //         referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
        //         referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
        //         remark: remark?.remark || "",
        //         created_at: moment(lead.referred_date).format("DD/MM/YYYY"),
        //         updated_at: moment(lead.referred_date).format("DD/MM/YYYY"),
        //         created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
        //         updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
        //     })
        // }
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


export const BackUpAllLeads = async (req: Request, res: Response, next: NextFunction) => {
    const value = String(req.query.value)
    let fileName = "blank.xlsx"
    let leads = await Lead.find().populate('created_by').populate('updated_by')
    if (value === "leads" || value === "mobiles") {
        if (leads.length > 0) {
            if (value === "leads") {
                SaveLeadsToExcel(leads)
                fileName = "leads_backup.xlsx"
            }
            if (value === "mobiles") {
                SaveLeadMobilesToExcel(leads)
                fileName = "lead_mobiles_backup.xlsx"
            }
            return res.download("./file", fileName)
        }
    }

    res.status(200).json({ message: "no leads found" })
}

export const CreateLead = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    let { mobile, remark, alternate_mobile1, alternate_mobile2 } = body as CreateOrEditLeadDto

    // validations
    if (!mobile)
        return res.status(400).json({ message: "provide primary mobile number" });

    if (await ReferredParty.findOne({ mobile: mobile }))
        return res.status(400).json({ message: "our refer party exists with this mobile" });
    let uniqueNumbers = []
    if (mobile)
        uniqueNumbers.push(mobile)
    if (alternate_mobile1)
        uniqueNumbers.push(alternate_mobile1)
    if (alternate_mobile2)
        uniqueNumbers.push(alternate_mobile2)

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);

    if (uniqueNumbers[0] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { alternate_mobile1: uniqueNumbers[0] }, { alternate_mobile2: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { alternate_mobile1: uniqueNumbers[1] }, { alternate_mobile2: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { alternate_mobile1: uniqueNumbers[2] }, { alternate_mobile2: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })

    let visiting_card: Asset = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `crm/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc)
            visiting_card = doc
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    let state = "unknown";
    if (body.state && body.state != "") state = body.state
    let city = "unknown";
    if (body.city && body.city != "") city = body.city
    let lead = new Lead({
        ...body,
        stage: 'open',
        state: state,
        last_remark: remark || "",
        city: city,
        visiting_card: visiting_card,
        mobile: uniqueNumbers[0] || null,
        alternate_mobile1: uniqueNumbers[1] || null,
        alternate_mobile2: uniqueNumbers[2] || null,
        created_by: req.user,
        updated_by: req.user,
        created_at: new Date(Date.now()),
        updated_at: new Date(Date.now()),
    })
    if (remark) {
        let new_remark = new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        })
        await new_remark.save()
    }

    await lead.save()

    return res.status(200).json("lead created")
}


export const UpdateLead = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const { mobile, remark, alternate_mobile1, alternate_mobile2 } = body as CreateOrEditLeadDto

    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    // validations
    if (!mobile)
        return res.status(400).json({ message: "provide primary mobile number" });

    let uniqueNumbers = []
    if (mobile) {
        if (mobile === lead.mobile) {
            uniqueNumbers[0] = lead.mobile
        }
        if (mobile !== lead.mobile) {
            uniqueNumbers[0] = mobile
        }
    }
    if (alternate_mobile1) {
        if (alternate_mobile1 === lead.alternate_mobile1) {
            uniqueNumbers[1] = lead.alternate_mobile1
        }
        if (alternate_mobile1 !== lead.alternate_mobile1) {
            uniqueNumbers[1] = alternate_mobile1
        }
    }
    if (alternate_mobile2) {
        if (alternate_mobile2 === lead.alternate_mobile2) {
            uniqueNumbers[2] = lead.alternate_mobile2
        }
        if (alternate_mobile2 !== lead.alternate_mobile2) {
            uniqueNumbers[2] = alternate_mobile2
        }
    }

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);


    if (uniqueNumbers[0] && uniqueNumbers[0] !== lead.mobile && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { alternate_mobile1: uniqueNumbers[0] }, { alternate_mobile2: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && uniqueNumbers[1] !== lead.alternate_mobile1 && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { alternate_mobile1: uniqueNumbers[1] }, { alternate_mobile2: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && uniqueNumbers[2] !== lead.alternate_mobile2 && await Lead.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { alternate_mobile1: uniqueNumbers[2] }, { alternate_mobile2: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })


    let visiting_card = lead?.visiting_card;
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `crm/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            if (lead.visiting_card?._id)
                await destroyFile(lead.visiting_card._id)
            visiting_card = doc
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }
    if (remark)
        await new Remark({
            remark,
            lead: lead,
            created_at: new Date(),
            created_by: req.user,
            updated_at: new Date(),
            updated_by: req.user
        }).save()
    let state = "unknown";
    if (body.state && body.state != "") state = body.state
    let city = "unknown";
    if (body.city && body.city != "") city = body.city
    await Lead.findByIdAndUpdate(lead._id, {
        ...body,
        last_remark: remark ? remark : lead.last_remark,
        city: city,
        state: state,
        mobile: uniqueNumbers[0] || null,
        alternate_mobile1: uniqueNumbers[1] || null,
        alternate_mobile2: uniqueNumbers[2] || null,
        visiting_card: visiting_card,
        updated_by: req.user,
        updated_at: new Date(Date.now())
    })

    return res.status(200).json({ message: "lead updated" })
}


export const DeleteLead = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    let remarks = await Remark.find({ lead: lead._id })
    remarks.map(async (remark) => {
        await remark.remove()
    })
    await lead.remove()
    if (lead.visiting_card && lead.visiting_card._id)
        await destroyFile(lead.visiting_card?._id)

    return res.status(200).json({ message: "lead and related remarks are deleted" })
}

export const BulkLeadUpdateFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateAndUpdatesLeadFromExcelDto[] = []
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
        let workbook_response: CreateAndUpdatesLeadFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        let checkednumbers: string[] = []
        for (let i = 0; i < workbook_response.length; i++) {
            let lead = workbook_response[i]
            let new_: IUser[] = []
            let mobile: string | null = lead.mobile
            let stage: string | null = lead.stage
            let leadtype: string | null = lead.lead_type
            let source: string | null = lead.lead_source
            let city: string | null = lead.city
            let state: string | null = lead.state
            let alternate_mobile1: string | null = lead.alternate_mobile1
            let alternate_mobile2: string | null = lead.alternate_mobile2
            let uniqueNumbers: string[] = []
            let validated = true

            //important
            if (!mobile) {
                validated = false
                statusText = "required mobile"
            }

            if (mobile && Number.isNaN(Number(mobile))) {
                validated = false
                statusText = "invalid mobile"
            }
            if (alternate_mobile1 && Number.isNaN(Number(alternate_mobile1))) {
                validated = false
                statusText = "invalid alternate mobile 1"
            }
            if (alternate_mobile2 && Number.isNaN(Number(alternate_mobile2))) {
                validated = false
                statusText = "invalid alternate mobile 2"
            }
            if (alternate_mobile1 && String(alternate_mobile1).length !== 10)
                alternate_mobile1 = null
            if (alternate_mobile2 && String(alternate_mobile2).length !== 10)
                alternate_mobile2 = null

            if (mobile && String(mobile).length !== 10) {
                validated = false
                statusText = "invalid mobile"
            }



            //duplicate mobile checker
            if (lead._id && isMongoId(String(lead._id))) {
                let targetLead = await Lead.findById(lead._id)
                if (targetLead) {
                    if (mobile && mobile === targetLead?.mobile) {
                        uniqueNumbers.push(targetLead?.mobile)
                    }
                    if (alternate_mobile1 && alternate_mobile1 === targetLead?.alternate_mobile1) {
                        uniqueNumbers.push(targetLead?.alternate_mobile1)
                    }
                    if (alternate_mobile2 && alternate_mobile2 === targetLead?.alternate_mobile2) {
                        uniqueNumbers.push(targetLead?.alternate_mobile2)
                    }

                    if (mobile && mobile !== targetLead?.mobile) {
                        let ld = await Lead.findOne({ $or: [{ mobile: mobile }, { alternate_mobile1: mobile }, { alternate_mobile2: mobile }] })
                        if (!ld && !checkednumbers.includes(mobile)) {
                            uniqueNumbers.push(mobile)
                            checkednumbers.push(mobile)
                        }
                    }

                    if (alternate_mobile1 && alternate_mobile1 !== targetLead?.alternate_mobile1) {
                        let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile1 }, { alternate_mobile1: alternate_mobile1 }, { alternate_mobile2: alternate_mobile1 }] })
                        if (!ld && !checkednumbers.includes(alternate_mobile1)) {
                            uniqueNumbers.push(alternate_mobile1)
                            checkednumbers.push(alternate_mobile1)
                        }
                    }

                    if (alternate_mobile2 && alternate_mobile2 !== targetLead?.alternate_mobile2) {
                        let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile2 }, { alternate_mobile1: alternate_mobile2 }, { alternate_mobile2: alternate_mobile2 }] })
                        if (!ld && !checkednumbers.includes(alternate_mobile2)) {
                            uniqueNumbers.push(alternate_mobile2)
                            checkednumbers.push(alternate_mobile2)
                        }
                    }
                }
            }

            if (!lead._id || !isMongoId(String(lead._id))) {
                if (mobile) {
                    let ld = await Lead.findOne({ $or: [{ mobile: mobile }, { alternate_mobile1: mobile }, { alternate_mobile2: mobile }] })
                    if (ld) {
                        validated = false
                        statusText = "duplicate"
                    }
                    if (!ld) {
                        uniqueNumbers.push(mobile)
                    }
                }

                if (alternate_mobile1) {
                    let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile1 }, { alternate_mobile1: alternate_mobile1 }, { alternate_mobile2: alternate_mobile1 }] })
                    if (ld) {
                        validated = false
                        statusText = "duplicate"
                    }
                    if (!ld) {
                        uniqueNumbers.push(alternate_mobile1)
                    }
                }
                if (alternate_mobile2) {
                    let ld = await Lead.findOne({ $or: [{ mobile: alternate_mobile2 }, { alternate_mobile1: alternate_mobile2 }, { alternate_mobile2: alternate_mobile2 }] })
                    if (ld) {
                        validated = false
                        statusText = "duplicate"
                    }
                    if (!ld) {
                        uniqueNumbers.push(alternate_mobile2)
                    }
                }

            }

            if (validated && uniqueNumbers.length > 0) {
                //update and create new nead
                if (lead._id && isMongoId(String(lead._id))) {
                    await Lead.findByIdAndUpdate(lead._id, {
                        ...lead,
                        stage: stage ? stage : "unknown",
                        lead_type: leadtype ? leadtype : "unknown",
                        lead_source: source ? source : "unknown",
                        city: city ? city : "unknown",
                        state: state ? state : "unknown",
                        mobile: uniqueNumbers[0],
                        alternate_mobile1: uniqueNumbers[1] || null,
                        alternate_mobile2: uniqueNumbers[2] || null,
                        updated_by: req.user,
                        updated_at: new Date(Date.now())
                    })
                    statusText = "updated"
                }
                if (!lead._id || !isMongoId(String(lead._id))) {
                    let newlead = new Lead({
                        ...lead,
                        _id: new Types.ObjectId(),
                        stage: stage ? stage : "unknown",
                        state: state ? state : "unknown",
                        lead_type: leadtype ? leadtype : "unknown",
                        lead_source: source ? source : "unknown",
                        city: city ? city : "unknown",
                        mobile: uniqueNumbers[0] || null,
                        alternate_mobile1: uniqueNumbers[1] || null,
                        alternate_mobile2: uniqueNumbers[2] || null,
                        created_by: req.user,
                        updated_by: req.user,
                        updated_at: new Date(Date.now()),
                        created_at: new Date(Date.now())
                    })

                    await newlead.save()
                    statusText = "created"
                }
            }

            result.push({
                ...lead,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}


//refer apis
export const GetRefers = async (req: Request, res: Response, next: NextFunction) => {
    let refers: IReferredParty[] = []
    let result: GetReferDto[] = []
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    refers = await ReferredParty.find({ 'state': { $in: states }, 'city': { $in: cities } }).sort('name')

    result = refers.map((r) => {
        return {
            _id: r._id,
            name: r.name,
            last_remark: r.last_remark,
            refers: 0,
            uploaded_bills: r.uploaded_bills,
            customer_name: r.customer_name,
            mobile: r.mobile,
            mobile2: r.mobile2,
            mobile3: r.mobile3,
            address: r.address,
            gst: r.gst,
            city: r.city,
            state: r.state,
            convertedfromlead: r.convertedfromlead,
            created_at: moment(r.created_at).format("DD/MM/YYYY"),
            updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
            updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
        }
    })

    return res.status(200).json(refers);
}


export const GetPaginatedRefers = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let result: GetReferDto[] = []
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let parties: IReferredParty[] = []
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        parties = await ReferredParty.find({ state: { $in: states }, city: { $in: cities } }).populate('created_by').populate('updated_by').sort('-updated_at')
        let count = parties.length
        parties = parties.slice((page - 1) * limit, limit * page)
        result = parties.map((r) => {
            return {
                _id: r._id,
                name: r.name,
                refers: r.refers,
                last_remark: r.last_remark,
                customer_name: r.customer_name,
                mobile: r.mobile,
                mobile2: r.mobile2,
                mobile3: r.mobile3,
                uploaded_bills: r.uploaded_bills,
                address: r.address,
                gst: r.gst,
                city: r.city,
                state: r.state,
                convertedfromlead: r.convertedfromlead,
                created_at: moment(r.created_at).format("DD/MM/YYYY"),
                updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
            }
        })
        return res.status(200).json({
            result: result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }
    else return res.status(400).json({ message: 'bad request' })

}


export const FuzzySearchRefers = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let key = String(req.query.key).split(",")
    let user = await User.findById(req.user).populate('assigned_crm_states').populate('assigned_crm_cities');
    let states = user?.assigned_crm_states.map((item) => { return item.state })
    let cities = user?.assigned_crm_cities.map((item) => { return item.city })
    let result: GetReferDto[] = []
    if (!key)
        return res.status(500).json({ message: "bad request" })
    let parties: IReferredParty[] = []
    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (key.length == 1 || key.length > 4) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },
                $or: [
                    { name: { $regex: key[0], $options: 'i' } },
                    { gst: { $regex: key[0], $options: 'i' } },
                    { customer_name: { $regex: key[0], $options: 'i' } },
                    { mobile: { $regex: key[0], $options: 'i' } },
                    { mobile2: { $regex: key[0], $options: 'i' } },
                    { mobile3: { $regex: key[0], $options: 'i' } },
                    { city: { $regex: key[0], $options: 'i' } },
                    { state: { $regex: key[0], $options: 'i' } },
                ]
            }).populate('created_by').populate('updated_by').sort('-updated_at')

        }
        if (key.length == 2) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },

                $and: [
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    }
                ]
                ,

            }
            ).populate('created_by').populate('updated_by').sort('-updated_at')

        }

        if (key.length == 3) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },

                $and: [
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    }
                ]
                ,

            }
            ).populate('created_by').populate('updated_by').sort('-updated_at')

        }
        if (key.length == 4) {

            parties = await ReferredParty.find({
                state: { $in: states }, city: { $in: cities },
                $and: [
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    },
                    {
                        $or: [
                            { name: { $regex: key[0], $options: 'i' } },
                            { customer_name: { $regex: key[0], $options: 'i' } },
                            { gst: { $regex: key[0], $options: 'i' } },
                            { mobile: { $regex: key[0], $options: 'i' } },
                            { mobile2: { $regex: key[0], $options: 'i' } },
                            { mobile3: { $regex: key[0], $options: 'i' } },
                            { city: { $regex: key[0], $options: 'i' } },
                            { state: { $regex: key[0], $options: 'i' } },
                        ]
                    }
                ]
                ,

            }
            ).populate('created_by').populate('updated_by').sort('-updated_at')

        }

        let count = parties.length
        parties = parties.slice((page - 1) * limit, limit * page)
        result = parties.map((r) => {
            return {
                _id: r._id,
                name: r.name,
                refers: r.refers,
                last_remark: r?.last_remark || "",
                customer_name: r.customer_name,
                uploaded_bills: r.uploaded_bills,
                mobile: r.mobile,
                mobile2: r.mobile2,
                mobile3: r.mobile3,
                address: r.address,
                gst: r.gst,
                city: r.city,
                state: r.state,
                convertedfromlead: r.convertedfromlead,
                created_at: moment(r.created_at).format("DD/MM/YYYY"),
                updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
                created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
                updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
            }
        })
        return res.status(200).json({
            result: result,
            total: Math.ceil(count / limit),
            page: page,
            limit: limit
        })
    }

    else
        return res.status(400).json({ message: "bad request" })

}


export const CreateReferParty = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const { name, customer_name, city, state, gst, mobile, mobile2, mobile3 } = body as CreateOrEditReferDto
    if (!name || !city || !state || !mobile || !gst) {
        return res.status(400).json({ message: "please fill all required fields" })
    }

    let uniqueNumbers = []
    if (mobile)
        uniqueNumbers.push(mobile)
    if (mobile2)
        uniqueNumbers.push(mobile2)
    if (mobile3)
        uniqueNumbers.push(mobile3)

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);

    if (uniqueNumbers[0] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { mobile2: uniqueNumbers[0] }, { mobile3: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { mobile2: uniqueNumbers[1] }, { mobile3: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { mobile2: uniqueNumbers[2] }, { mobile3: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })


    let resultParty = await ReferredParty.findOne({ $or: [{ gst: String(gst).toLowerCase().trim() }, { mobile: String(mobile).toLowerCase().trim() }] })
    if (resultParty) {
        return res.status(400).json({ message: "already exists  gst" })
    }


    let party = await new ReferredParty({
        name, customer_name, city, state,
        mobile: uniqueNumbers[0] || null,
        mobile2: uniqueNumbers[1] || null,
        mobile3: uniqueNumbers[2] || null,
        gst,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(party)
}

export const UpdateReferParty = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let body = JSON.parse(req.body.body)
    const { name, customer_name, city, state, mobile, mobile2, mobile3, gst } = body as CreateOrEditReferDto
    if (!name || !city || !state || !mobile) {
        return res.status(400).json({ message: "please fill all required fields" })
    }
    let party = await ReferredParty.findById(id)

    if (!party)
        return res.status(404).json({ message: "party not found" })
    if (gst !== party.gst) {
        let resultParty = await ReferredParty.findOne({ gst: gst });
        if (resultParty) {
            return res.status(400).json({ message: "already exists this  gst" })
        }
    }
    let uniqueNumbers = []
    if (mobile) {
        if (mobile === party.mobile) {
            uniqueNumbers[0] = party.mobile
        }
        if (mobile !== party.mobile) {
            uniqueNumbers[0] = mobile
        }
    }
    if (mobile2) {
        if (mobile2 === party.mobile2) {
            uniqueNumbers[1] = party.mobile2
        }
        if (mobile2 !== party.mobile2) {
            uniqueNumbers[1] = mobile2
        }
    }
    if (mobile3) {
        if (mobile3 === party.mobile3) {
            uniqueNumbers[2] = party.mobile3
        }
        if (mobile3 !== party.mobile3) {
            uniqueNumbers[2] = mobile3
        }
    }

    uniqueNumbers = uniqueNumbers.filter((item, i, ar) => ar.indexOf(item) === i);


    if (uniqueNumbers[0] && uniqueNumbers[0] !== party.mobile && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[0] }, { mobile2: uniqueNumbers[0] }, { mobile3: uniqueNumbers[0] }] }))
        return res.status(400).json({ message: `${mobile} already exists ` })


    if (uniqueNumbers[1] && uniqueNumbers[1] !== party.mobile2 && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[1] }, { mobile2: uniqueNumbers[1] }, { mobile3: uniqueNumbers[1] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[1]} already exists ` })

    if (uniqueNumbers[2] && uniqueNumbers[2] !== party.mobile3 && await ReferredParty.findOne({ $or: [{ mobile: uniqueNumbers[2] }, { mobile2: uniqueNumbers[2] }, { mobile3: uniqueNumbers[2] }] }))
        return res.status(400).json({ message: `${uniqueNumbers[2]} already exists ` })

    await ReferredParty.findByIdAndUpdate(id, {
        name, customer_name, city, state,
        mobile: uniqueNumbers[0] || null,
        mobile2: uniqueNumbers[1] || null,
        mobile3: uniqueNumbers[2] || null,
        gst,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    })
    return res.status(200).json({ message: "updated" })
}


export const DeleteReferParty = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    if (!isMongoId(id))
        return res.status(400).json({ message: "bad mongo id" })
    let party = await ReferredParty.findById(id)
    if (!party)
        return res.status(404).json({ message: "party not found" })
    await ReferredParty.findByIdAndDelete(id)
    return res.status(200).json({ message: "deleted" })
}

export const BulkDeleteUselessLeads = async (req: Request, res: Response, next: NextFunction) => {
    const { leads_ids } = req.body as { leads_ids: string[] }
    for (let i = 0; i <= leads_ids.length; i++) {
        let lead = await Lead.findById(leads_ids[i])
        if (lead && lead.stage == 'useless') {
            let remarks = await Remark.find({ lead: lead._id })
            remarks.map(async (remark) => {
                await remark.remove()
            })
            await lead.remove()
            if (lead.visiting_card && lead.visiting_card._id)
                await destroyFile(lead.visiting_card?._id)
        }
    }
    return res.status(200).json({ message: "lead and related remarks are deleted" })
}

export const BulkReferUpdateFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: CreateOrEditReferFromExcelDto[] = []
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
        let workbook_response: CreateOrEditReferFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }
        for (let i = 0; i < workbook_response.length; i++) {
            let refer = workbook_response[i]
            let name: string | null = refer.name
            let mobile: string | null = refer.mobile
            let city: string | null = refer.city
            let state: string | null = refer.state
            let gst: string | null = refer.gst

            let validated = true

            //important
            if (!mobile) {
                validated = false
                statusText = "required mobile"
            }
            if (!name) {
                validated = false
                statusText = "required name"
            }
            if (!city) {
                validated = false
                statusText = "required city"
            }
            if (!state) {
                validated = false
                statusText = "required state"
            }
            if (!gst) {
                validated = false
                statusText = "required gst"
            }
            if (gst && gst.length !== 15) {
                validated = false
                statusText = "invalid gst"
            }
            if (mobile && Number.isNaN(Number(mobile))) {
                validated = false
                statusText = "invalid mobile"
            }


            if (mobile && String(mobile).length !== 10) {
                validated = false
                statusText = "invalid mobile"
            }
            //update and create new nead
            if (validated) {
                if (refer._id && isMongoId(String(refer._id))) {
                    let targetLead = await ReferredParty.findById(refer._id)
                    if (targetLead) {
                        if (targetLead.mobile != String(mobile).toLowerCase().trim() || targetLead.gst !== String(gst).toLowerCase().trim()) {
                            let refertmp = await ReferredParty.findOne({ mobile: String(mobile).toLowerCase().trim() })
                            let refertmp2 = await ReferredParty.findOne({ gst: String(gst).toLowerCase().trim() })

                            if (refertmp) {
                                validated = false
                                statusText = "exists mobile"
                            }
                            if (refertmp2) {
                                validated = false
                                statusText = "exists  gst"
                            }
                            else {
                                await ReferredParty.findByIdAndUpdate(refer._id, {
                                    ...refer,
                                    city: city ? city : "unknown",
                                    state: state ? state : "unknown",
                                    updated_by: req.user,
                                    updated_at: new Date(Date.now())
                                })
                                statusText = "updated"
                            }
                        }
                    }
                }

                if (!refer._id || !isMongoId(String(refer._id))) {
                    let refertmp = await ReferredParty.findOne({
                        $or: [
                            { mobile: String(mobile).toLowerCase().trim() },
                            { gst: String(gst).toLowerCase().trim() }
                        ]
                    })
                    if (refertmp) {
                        validated = false
                        statusText = "duplicate mobile or gst"
                    }
                    else {
                        let referParty = new ReferredParty({
                            ...refer,
                            _id: new Types.ObjectId(),
                            city: city ? city : "unknown",
                            state: state ? state : "unknown",
                            mobile: refer.mobile,
                            created_by: req.user,
                            updated_by: req.user,
                            updated_at: new Date(Date.now()),
                            created_at: new Date(Date.now()),
                            remarks: undefined
                        })

                        await referParty.save()
                        statusText = "created"
                    }

                }
            }
            result.push({
                ...refer,
                status: statusText
            })
        }
    }
    return res.status(200).json(result);
}


//remarks apis
export const UpdateRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, remind_date } = req.body as CreateOrEditRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const user = await User.findById(req.user?._id)
    if (!user)
        return res.status(403).json({ message: "please login to access this resource" })
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let rremark = await Remark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    rremark.remark = remark
    if (remind_date)
        rremark.remind_date = new Date(remind_date)
    await rremark.save()
    await Lead.findByIdAndUpdate(rremark.lead, { last_remark: remark })
    return res.status(200).json({ message: "remark updated successfully" })
}

export const DeleteRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })
    let rremark = await Remark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}

export const GetMyReminders = async (req: Request, res: Response, next: NextFunction) => {
    let previous_date = new Date()
    let day = previous_date.getDate() - 100
    previous_date.setDate(day)
    let remarks = await Remark.find({ created_at: { $lte: new Date(), $gte: previous_date } }).populate('created_by').populate('updated_by').populate({
        path: 'lead',
        populate: [
            {
                path: 'created_by',
                model: 'User'
            },
            {
                path: 'updated_by',
                model: 'User'
            },
            {
                path: 'referred_party',
                model: 'ReferredParty'
            }
        ]
    }).sort('-created_at')
    let result: GetActivitiesOrRemindersDto[] = []
    let ids: string[] = []
    let filteredRemarks: IRemark[] = []

    remarks.forEach((rem) => {
        if (rem && rem.lead && !ids.includes(rem.lead._id)) {
            ids.push(rem.lead._id);
            if (rem.created_by._id.valueOf() == req.user?._id && rem.remind_date && new Date(rem.remind_date).getDate() <= new Date().getDate() && new Date(rem.remind_date).getMonth() <= new Date().getMonth() && new Date(rem.remind_date).getFullYear() <= new Date().getFullYear())
                filteredRemarks.push(rem);
        }
    })
    filteredRemarks.sort(function (a, b) {
        //@ts-ignore
        return new Date(b.remind_date) - new Date(a.remind_date);
    });

    result = filteredRemarks.map((rem) => {
        return {
            _id: rem._id,
            remark: rem.remark,
            created_at: rem.created_at && moment(rem.created_at).format("DD/MM/YYYY"),
            remind_date: rem.remind_date && moment(rem.remind_date).format("DD/MM/YYYY"),
            created_by: { id: rem.created_by._id, value: rem.created_by.username, label: rem.created_by.username },
            lead_id: rem.lead && rem.lead._id,
            name: rem.lead && rem.lead.name,
            customer_name: rem.lead && rem.lead.customer_name,
            customer_designation: rem.lead && rem.lead.customer_designation,
            mobile: rem.lead && rem.lead.mobile,
            gst: rem.lead && rem.lead.gst,
            has_card: rem.lead && rem.lead.has_card,
            email: rem.lead && rem.lead.email,
            city: rem.lead && rem.lead.city,
            state: rem.lead && rem.lead.state,
            country: rem.lead && rem.lead.country,
            address: rem.lead && rem.lead.address,
            work_description: rem.lead && rem.lead.work_description,
            turnover: rem.lead && rem.lead.turnover,
            alternate_mobile1: rem.lead && rem.lead.alternate_mobile1,
            alternate_mobile2: rem.lead && rem.lead.alternate_mobile2,
            alternate_email: rem.lead && rem.lead.alternate_email,
            lead_type: rem.lead && rem.lead.lead_type,
            stage: rem.lead && rem.lead.stage,
            lead_source: rem.lead && rem.lead.lead_source,
            visiting_card: rem.lead && rem.lead.visiting_card?.public_url || "",
            referred_party_name: rem.lead && rem.lead.referred_party?.name || "",
            referred_party_mobile: rem.lead && rem.lead.referred_party?.mobile || "",
            referred_date: rem.lead && rem.lead.referred_date && moment(rem.lead && rem.lead.referred_date).format("DD/MM/YYYY") || "",
        }
    })


    return res.status(200).json(result)
}
export const GetReferRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "refer id not valid" })
    let refer = await ReferredParty.findById(id);
    if (!refer) {
        return res.status(404).json({ message: "refer not found" })
    }
    let remarks: IRemark[] = []
    let result: GetRemarksDto[] = []
    remarks = await Remark.find({ refer: refer._id }).populate('created_by').populate('updated_by').sort('-created_at')
    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            refer_id: refer?._id,
            refer_name: refer?.name,
            refer_mobile: refer?.mobile,
            remind_date: r.remind_date && moment(r.remind_date).format("DD/MM/YYYY"),
            created_date: moment(r.created_at).format("DD/MM/YYYY"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
        }
    })
    return res.json(result)
}
export const GetRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    let remarks: IRemark[] = []
    let result: GetRemarksDto[] = []
    remarks = await Remark.find({ lead: lead._id }).populate('created_by').populate('updated_by').populate({
        path: 'lead',
        populate: [
            {
                path: 'created_by',
                model: 'User'
            },
            {
                path: 'updated_by',
                model: 'User'
            },
            {
                path: 'referred_party',
                model: 'ReferredParty'
            }
        ]
    }).sort('-created_at')
    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            lead_id: lead?._id,
            lead_name: lead?.name,
            lead_mobile: lead?.mobile,
            remind_date: r.remind_date && moment(r.remind_date).format("DD/MM/YYYY"),
            created_date: moment(r.created_at).format("lll"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username }
        }
    })
    return res.json(result)
}

export const GetActivitiesTopBarDetails = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetActivitiesTopBarDetailsDto[] = []
    let start_date = req.query.start_date
    let id = req.query.id
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    dt2.setHours(0)
    dt2.setMinutes(0)
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let stages = await Stage.find();
    let remarks: IRemark[] = []
    if (req.user?.is_admin && !id) {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('lead')

    }

    else if (ids && ids.length > 0 && !id) {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).populate('lead')
    }
    else if (!id) {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('lead')
    }
    else {
        remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('lead')
    }
    result.push({
        stage: "Activities", value: remarks.length
    });
    for (let i = 0; i <= stages.length; i++) {
        let stage = stages[i];
        if (stage) {
            let remarkscount = remarks.filter((r) => {
                if (r.lead && r.lead.stage === stage.stage)
                    return r;
            }).length;
            result.push({
                stage: stage.stage, value: remarkscount
            });
        }
    }
    return res.status(200).json(result)

}
export const GetActivities = async (req: Request, res: Response, next: NextFunction) => {
    let limit = Number(req.query.limit)
    let page = Number(req.query.page)
    let id = req.query.id
    let stage = req.query.stage
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let remarks: IRemark[] = []
    let count = 0
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    dt1.setHours(0)
    dt1.setMinutes(0)
    dt2.setHours(0)
    dt2.setMinutes(0)
    let ids = req.user?.assigned_users.map((id) => { return id._id })
    let result: GetActivitiesOrRemindersDto[] = []

    if (!Number.isNaN(limit) && !Number.isNaN(page)) {
        if (req.user?.is_admin && !id) {
            {
                remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').populate({
                    path: 'lead',
                    populate: [
                        {
                            path: 'created_by',
                            model: 'User'
                        },
                        {
                            path: 'updated_by',
                            model: 'User'
                        },
                        {
                            path: 'referred_party',
                            model: 'ReferredParty'
                        }
                    ]
                }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 } }).countDocuments()
            }
        }
        else if (ids && ids.length > 0 && !id) {
            {
                remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).populate('created_by').populate('updated_by').populate({
                    path: 'lead',
                    populate: [
                        {
                            path: 'created_by',
                            model: 'User'
                        },
                        {
                            path: 'updated_by',
                            model: 'User'
                        },
                        {
                            path: 'referred_party',
                            model: 'ReferredParty'
                        }
                    ]
                }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
                count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: { $in: ids } }).countDocuments()
            }
        }
        else if (!id) {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).populate('created_by').populate('updated_by').populate({
                path: 'lead',
                populate: [
                    {
                        path: 'created_by',
                        model: 'User'
                    },
                    {
                        path: 'updated_by',
                        model: 'User'
                    },
                    {
                        path: 'referred_party',
                        model: 'ReferredParty'
                    }
                ]
            }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: req.user?._id }).countDocuments()
        }

        else {
            remarks = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).populate('created_by').populate('updated_by').populate({
                path: 'lead',
                populate: [
                    {
                        path: 'created_by',
                        model: 'User'
                    },
                    {
                        path: 'updated_by',
                        model: 'User'
                    },
                    {
                        path: 'referred_party',
                        model: 'ReferredParty'
                    }
                ]
            }).sort('-updated_at').skip((page - 1) * limit).limit(limit)
            count = await Remark.find({ created_at: { $gte: dt1, $lt: dt2 }, created_by: id }).countDocuments()
        }
        if (stage !== 'undefined') {
            remarks = remarks.filter((r) => {
                if (r.lead)
                    return r.lead.stage == stage
            })

        }
        result = remarks.map((rem) => {
            return {
                _id: rem._id,
                remark: rem.remark,
                created_at: rem.created_at && moment(rem.created_at).format("LT"),
                remind_date: rem.remind_date && moment(rem.remind_date).format("DD/MM/YYYY"),
                created_by: { id: rem.created_by._id, value: rem.created_by.username, label: rem.created_by.username },
                lead_id: rem.lead && rem.lead._id,
                name: rem.lead && rem.lead.name,
                customer_name: rem.lead && rem.lead.customer_name,
                customer_designation: rem.lead && rem.lead.customer_designation,
                mobile: rem.lead && rem.lead.mobile,
                gst: rem.lead && rem.lead.gst,
                has_card: rem.lead && rem.lead.has_card,
                email: rem.lead && rem.lead.email,
                city: rem.lead && rem.lead.city,
                state: rem.lead && rem.lead.state,
                country: rem.lead && rem.lead.country,
                address: rem.lead && rem.lead.address,
                work_description: rem.lead && rem.lead.work_description,
                turnover: rem.lead && rem.lead.turnover,
                alternate_mobile1: rem.lead && rem.lead.alternate_mobile1,
                alternate_mobile2: rem.lead && rem.lead.alternate_mobile2,
                alternate_email: rem.lead && rem.lead.alternate_email,
                lead_type: rem.lead && rem.lead.lead_type,
                stage: rem.lead && rem.lead.stage,
                lead_source: rem.lead && rem.lead.lead_source,
                visiting_card: rem.lead && rem.lead.visiting_card?.public_url || "",
                referred_party_name: rem.lead && rem.lead.referred_party?.name || "",
                referred_party_mobile: rem.lead && rem.lead.referred_party?.mobile || "",
                referred_date: rem.lead && rem.lead.referred_party && moment(rem.lead.referred_date).format("DD/MM/YYYY") || "",

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

export const NewRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark, remind_date, has_card, stage } = req.body as CreateOrEditRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const user = await User.findById(req.user?._id)
    if (!user)
        return res.status(403).json({ message: "please login to access this resource" })
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "lead id not valid" })

    let lead = await Lead.findById(id)
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }

    let new_remark = new Remark({
        remark,
        lead: lead,
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    if (remind_date)
        new_remark.remind_date = new Date(remind_date)
    await new_remark.save()

    if (has_card)
        lead.has_card = true
    else
        lead.has_card = false
    lead.stage = stage
    if (req.user) {
        lead.updated_by = req.user
        lead.updated_at = new Date(Date.now())
        lead.last_remark = remark
    }
    await lead.save()
    return res.status(200).json({ message: "new remark added successfully" })
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

export const GetNewRefers = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetReferDto[] = [];
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let parties: IReferredParty[] = []

    parties = await ReferredParty.find({ created_at: { $gte: dt1, $lt: dt2 }, convertedfromlead: true }).populate('created_by').populate('updated_by').sort('-created_at');

    result = parties.map((r) => {
        return {
            _id: r._id,
            name: r.name,
            refers: r.refers,
            last_remark: r.last_remark || "",
            customer_name: r.customer_name,
            mobile: r.mobile,
            mobile2: r.mobile2,
            mobile3: r.mobile3,
            uploaded_bills: r.uploaded_bills,
            address: r.address,
            gst: r.gst,
            city: r.city,
            state: r.state,
            convertedfromlead: r.convertedfromlead,
            created_at: moment(r.created_at).format("DD/MM/YYYY"),
            updated_at: moment(r.updated_at).format("DD/MM/YYYY"),
            created_by: { id: r.created_by._id, value: r.created_by.username, label: r.created_by.username },
            updated_by: { id: r.updated_by._id, value: r.updated_by.username, label: r.updated_by.username },
        }
    })
    return res.status(200).json(result)
}

export const GetAssignedRefers = async (req: Request, res: Response, next: NextFunction) => {
    let start_date = req.query.start_date
    let end_date = req.query.end_date
    let dt1 = new Date(String(start_date))
    let dt2 = new Date(String(end_date))
    let result: GetLeadDto[] = []
    let leads: ILead[] = []

    leads = await Lead.find({ referred_date: { $gte: dt1, $lt: dt2 } }).populate('created_by').populate('updated_by').populate('referred_party').sort('-referred_date')
    result = leads.map((lead) => {
        return {
            _id: lead._id,
            name: lead.name,
            customer_name: lead.customer_name,
            customer_designation: lead.customer_designation,
            mobile: lead.mobile,
            gst: lead.gst,
            uploaded_bills: lead.uploaded_bills,
            has_card: lead.has_card,
            email: lead.email,
            city: lead.city,
            state: lead.state,
            country: lead.country,
            address: lead.address,
            work_description: lead.work_description,
            turnover: lead.turnover,
            alternate_mobile1: lead.alternate_mobile1,
            alternate_mobile2: lead.alternate_mobile2,
            alternate_email: lead.alternate_email,
            lead_type: lead.lead_type,
            stage: lead.stage,
            lead_source: lead.lead_source,
            visiting_card: lead.visiting_card?.public_url || "",
            referred_party_name: lead.referred_party && lead.referred_party.name,
            referred_party_mobile: lead.referred_party && lead.referred_party.mobile,
            referred_date: lead.referred_party && moment(lead.referred_date).format("DD/MM/YYYY"),
            last_remark: lead.last_remark || "",
            created_at: moment(lead.created_at).format("DD/MM/YYYY"),
            updated_at: moment(lead.updated_at).format("DD/MM/YYYY"),
            created_by: { id: lead.created_by._id, value: lead.created_by.username, label: lead.created_by.username },
            updated_by: { id: lead.updated_by._id, value: lead.updated_by.username, label: lead.updated_by.username },
        }
    })
    return res.status(200).json(result)
}

export const CreateBill = async (req: Request, res: Response, next: NextFunction) => {
    let body = JSON.parse(req.body.body)
    const {
        items,
        lead,
        refer,
        remarks,
        bill_no,
        bill_date } = body as CreateOrEditBillDto
    console.log(body, bill_no)
    if (!bill_no || !bill_date || !items || !remarks) {
        return res.status(400).json({ message: "please fill all required fields" })
    }
    let bill;
    if (lead) {
        if (await Bill.findOne({ lead: lead, bill_no: bill_no.toLowerCase() }))
            return res.status(400).json({ message: "already exists this bill no" })
        bill = new Bill({
            bill_no, lead: lead, bill_date: new Date(bill_date), remarks,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })

    }
    else {
        if (await Bill.findOne({ refer: refer, bill_no: bill_no.toLowerCase() }))
            return res.status(400).json({ message: "already exists this bill no" })

        bill = new Bill({
            bill_no, refer: refer, bill_date: new Date(bill_date), remarks,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        })
    }
    let document: Asset = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `bills/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            document = doc
            bill.billphoto = document;
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        await new BillItem({
            article: item.article,
            rate: item.rate,
            qty: item.qty,
            bill: bill._id,
            created_at: new Date(),
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
    }
    await bill.save()
    if (lead) {
        let count = await Bill.find({ lead: lead }).countDocuments()
        await Lead.findByIdAndUpdate(lead, { uploaded_bills: count })
    }
    if (refer) {
        let count = await Bill.find({ refer: refer }).countDocuments()
        await ReferredParty.findByIdAndUpdate(refer, { uploaded_bills: count })
    }
    return res.status(201).json({ message: "success" })

}

export const UpdateBill = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    let bill = await Bill.findById(id)
    if (!bill)
        return res.status(404).json({ message: "bill not found" })
    let body = JSON.parse(req.body.body)
    const { items, bill_no, bill_date, remarks } = body as CreateOrEditBillDto

    if (!bill_no || !bill_date || !items || !remarks) {
        return res.status(400).json({ message: "please fill all required fields" })
    }

    if (bill.bill_no !== bill_no.toLowerCase())
        if (await Bill.findOne({ bill_no: bill_no.toLowerCase() }))
            return res.status(400).json({ message: "already exists this bill no" })
    let document: Asset = undefined
    if (req.file) {
        const allowedFiles = ["image/png", "image/jpeg", "image/gif", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "application/pdf"];
        const storageLocation = `bills/media`;
        if (!allowedFiles.includes(req.file.mimetype))
            return res.status(400).json({ message: `${req.file.originalname} is not valid, only ${allowedFiles} types are allowed to upload` })
        if (req.file.size > 20 * 1024 * 1024)
            return res.status(400).json({ message: `${req.file.originalname} is too large limit is :10mb` })
        const doc = await uploadFileToCloud(req.file.buffer, storageLocation, req.file.originalname)
        if (doc) {
            document = doc
            if (bill.billphoto)
                await destroyFile(bill.billphoto._id)
            bill.billphoto = document;
        }
        else {
            return res.status(500).json({ message: "file uploading error" })
        }
    }


    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let existBill = await BillItem.findById(item._id)
        if (existBill) {
            await BillItem.findByIdAndUpdate(id, {
                article: item.article,
                rate: item.rate,
                qty: item.qty,
                bill: bill._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            })
        }
        else {
            await new BillItem({
                article: item.article,
                rate: item.rate,
                qty: item.qty,
                bill: bill._id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: req.user,
                updated_by: req.user
            }).save()
        }

    }
    bill.bill_no = bill_no;
    bill.bill_date = new Date(bill_date);
    bill.remarks = remarks;
    bill.updated_at = new Date();
    if (req.user)
        bill.updated_by = req.user
    await bill.save()
    return res.status(200).json({ message: "updated" })

}
export const DeleteBill = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "bill id not valid" })
    let bill = await Bill.findById(id);
    if (!bill) {
        return res.status(404).json({ message: "bill not found" })
    }
    if (bill.billphoto)
        await destroyFile(bill.billphoto._id)
    await bill.remove();
    if (bill.lead) {
        let count = await Bill.find({ lead: bill.lead }).countDocuments()
        await Lead.findByIdAndUpdate(bill.lead, { uploaded_bills: count })
    }
    if (bill.refer) {
        let count = await Bill.find({ refer: bill.refer }).countDocuments()
        await ReferredParty.findByIdAndUpdate(bill.refer, { uploaded_bills: count })
    }
    return res.status(200).json({ message: "bill deleted successfully" })
}

export const GetReferPartyBillsHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let refer = await ReferredParty.findById(id);
    if (!refer) {
        return res.status(404).json({ message: "refer not found" })
    }
    let bills: IBill[] = []
    let result: GetBillDto[] = []
    bills = await Bill.find({ refer: refer._id }).populate('created_by').populate('updated_by').populate('refer').sort('-bill_date')

    for (let i = 0; i < bills.length; i++) {
        let bill = bills[i]
        let billItems = await BillItem.find({ bill: bill._id }).populate('article').sort('-bill_date')
        result.push({
            _id: bill._id,
            bill_no: bill.bill_no,
            refer: { id: refer && refer._id, value: refer && refer.name, label: refer && refer.name },
            remarks: bill.remarks,
            billphoto: bill.billphoto?.public_url || "",
            items: billItems.map((i) => {
                return {
                    _id: i._id,
                    article: i.article._id,
                    qty: i.qty,
                    rate: i.rate
                }
            }),
            bill_date: bill.bill_date && moment(bill.bill_date).format("DD/MM/YYYY"),
            created_at: bill.created_at,
            updated_at: bill.updated_at,
            created_by: { id: bill.created_by._id, value: bill.created_by.username, label: bill.created_by.username },
            updated_by: { id: bill.updated_by._id, value: bill.updated_by.username, label: bill.updated_by.username }
        })
    }
    return res.json(result)
}

export const GetLeadPartyBillsHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(400).json({ message: "lead id not valid" })
    let lead = await Lead.findById(id);
    if (!lead) {
        return res.status(404).json({ message: "lead not found" })
    }
    let bills: IBill[] = []
    let result: GetBillDto[] = []
    bills = await Bill.find({ lead: lead._id }).populate('created_by').populate('updated_by').populate('lead').sort('-bill_date')

    for (let i = 0; i < bills.length; i++) {
        let bill = bills[i]
        let billItems = await BillItem.find({ bill: bill._id }).populate('article').sort('-bill_date')
        result.push({
            _id: bill._id,
            bill_no: bill.bill_no,
            lead: { id: lead && lead._id, value: lead && lead.name, label: lead && lead.name },
            billphoto: bill.billphoto?.public_url || "",
            remarks: bill.remarks,
            items: billItems.map((i) => {
                return {
                    _id: i._id,
                    article: i.article._id,
                    qty: i.qty,
                    rate: i.rate
                }
            }),
            bill_date: bill.bill_date && moment(bill.bill_date).format("DD/MM/YYYY"),
            created_at: bill.created_at,
            updated_at: bill.updated_at,
            created_by: { id: bill.created_by._id, value: bill.created_by.username, label: bill.created_by.username },
            updated_by: { id: bill.updated_by._id, value: bill.updated_by.username, label: bill.updated_by.username }
        })
    }
    return res.json(result)
}

export const test = async (req: Request, res: Response, next: NextFunction) => {
    let dt1 = new Date(String(req.query.dt1));
    let dt2 = new Date(String(req.query.dt2))
    let frequency = "daily"

    let result: {
        dt1: string,
        dt2: string,
        checked: boolean
    }[] = []


    if (frequency == "daily") {
        let current_date = new Date(dt1)
        
        while (current_date <= new Date(dt2)) {
            result.push({
                dt1: current_date.toString(),
                dt2: new Date(new Date().setDate(new Date(current_date).getDate() + 1)).toString() ,
                checked: true
            })
            current_date.setDate(new Date(current_date).getDate() + 1)
        }
    }
    if (frequency == "weekly") {
        let current_date = new Date()
        current_date.setDate(1)
        while (current_date <= new Date(dt2)) {
            result.push({
                dt1: current_date.toString(),
                dt2: new Date().setDate(new Date(current_date).getDate() + 6).toString(),
                checked: true
            })
            current_date.setDate(new Date(current_date).getDate() + 6)
        }
    }
    // if (frequency === "monthly") {
    //     let current_date = new Date(dt1); // Start from the first date of the range
    //     current_date.setDate(1); // Set to the first day of the month

    //     // Iterate while current_date is less than or equal to dt2
    //     while (current_date <= new Date(dt2)) {
    //         // Calculate the next month's date
    //         let nextMonthDate = new Date(current_date);
    //         nextMonthDate.setMonth(current_date.getMonth() + 1);

    //         // Check if the current month is within the specified date range
    //         if (current_date >= dt1 && current_date < dt2) {
    //             let remark = await Remark.findOne({
    //                 maintainable_item: item._id,
    //                 created_at: { $gte: current_date, $lt: nextMonthDate }
    //             });

    //             result.push({
    //                 dt1: current_date.toString(),
    //                 dt2: nextMonthDate.toString(),
    //                 checked: remark && item.stage === 'done' ? true : false
    //             });
    //         }

    //         // Move to the next month
    //         current_date.setMonth(current_date.getMonth() + 1);
    //     }
    // }

    // if (frequency === "yearly") {
    //     let current_date = new Date(dt1); // Start from the first date of the range
    //     current_date.setMonth(0); // Set to January (month 0)
    //     current_date.setDate(1); // Set to the first day of the month

    //     // Iterate while current_date is less than or equal to dt2
    //     while (current_date <= new Date(dt2)) {
    //         // Calculate the next year's date
    //         let nextYearDate = new Date(current_date);
    //         nextYearDate.setFullYear(current_date.getFullYear() + 1);

    //         // Check if the current year is within the specified date range
    //         if (current_date >= dt1 && current_date < dt2) {
    //             let remark = await Remark.findOne({
    //                 maintainable_item: item._id,
    //                 created_at: { $gte: current_date, $lt: nextYearDate }
    //             });

    //             result.push({
    //                 dt1: current_date.toString(),
    //                 dt2: nextYearDate.toString(),
    //                 checked: remark && item.stage === 'done' ? true : false
    //             });
    //         }

    //         // Move to the next year
    //         current_date.setFullYear(current_date.getFullYear() + 1);
    //     }
    // }

    return res.status(200).json(result);
}