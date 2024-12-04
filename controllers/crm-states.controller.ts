import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';

import isMongoId from "validator/lib/isMongoId";
import { GetCrmStateDto } from "../dtos/crm-state.dto";
import { CRMState, ICRMState } from "../models/crm-state.model";
import Lead from "../models/lead.model";
import { ReferredParty } from "../models/refer.model";
import { User } from "../models/user.model";

export const GetAllCRMStates = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetCrmStateDto[] = []
    let states = await CRMState.find()

    for (let i = 0; i < states.length; i++) {
        let users = await (await User.find({ assigned_crm_states: states[i]._id })).map((i) => { return { _id: i._id.valueOf(), username: i.username } })
        result.push({
            _id: states[i]._id, alias1: states[i].alias1,
            alias2: states[i].alias2, state: states[i].state, assigned_users: String(users.map((u) => { return u.username }))
        });
    }
    return res.status(200).json(result)
}


export const CreateCRMState = async (req: Request, res: Response, next: NextFunction) => {
    const { state,alias1,alias2 } = req.body as { state: string, alias1: string, alias2: string }
    if (!state) {
        return res.status(400).json({ message: "please fill all reqired fields" })
    }
    if (await CRMState.findOne({ state: state.toLowerCase() }))
        return res.status(400).json({ message: "already exists this state" })
    let result = await new CRMState({
        state: state,
        alias1: alias1,
        alias2: alias2,
        updated_at: new Date(),
        created_by: req.user,
        updated_by: req.user
    }).save()
    return res.status(201).json(result)

}
export const AssignCRMStatesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { state_ids, user_ids, flag } = req.body as { state_ids: string[], user_ids: string[], flag: number }
    if (state_ids && state_ids.length === 0)
        return res.status(400).json({ message: "please select one state " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one state owner" })

    let owners = user_ids

    if (flag == 0) {
        for (let k = 0; k < owners.length; k++) {
            let owner = await User.findById(owners[k]).populate('assigned_crm_states')
            if (owner) {
                let oldstates = owner.assigned_crm_states.map((item) => { return item._id.valueOf() });
                oldstates = oldstates.filter((item) => { return !state_ids.includes(item) });
                let newStates: ICRMState[] = [];

                for (let i = 0; i < oldstates.length; i++) {
                    let state = await CRMState.findById(oldstates[i]);
                    if (state)
                        newStates.push(state)
                }

                await User.findByIdAndUpdate(owner._id, {
                    assigned_crm_states: oldstates,
                })
            }
        }
    }
    else {
        for (let k = 0; k < owners.length; k++) {
            const user = await User.findById(owners[k]).populate('assigned_crm_states')
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
                await user.save();
            }

        }
    }

    return res.status(200).json({ message: "successfull" })
}

export const UpdateCRMState = async (req: Request, res: Response, next: NextFunction) => {
    const { state ,alias1,alias2} = req.body as { state: string, alias1: string, alias2: string }
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
    oldstate.alias1 = alias1
    oldstate.alias2 = alias2
    oldstate.updated_at = new Date()
    if (req.user)
        oldstate.updated_by = req.user

    await Lead.updateMany({ state: prevstate }, { state: state })
    await ReferredParty.updateMany({ state: prevstate }, { state: state })

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
    let result: { state: string, status?: any }[] = []
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

export const FindUnknownCrmSates = async (req: Request, res: Response, next: NextFunction) => {
    let states = await CRMState.find({ state: { $ne: "" } });
    let statevalues = states.map(i => { return i.state });
    await Lead.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
    await ReferredParty.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
    return res.status(200).json({ message: "successfull" })
}