import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { CreateOrEditErpStateDto, GetErpStateDto, GetErpStateFromExcelDto } from "../dtos";
import { State } from "../models/erp-state";
import { User } from "../models/user";
import moment from "moment";
import mongoose from "mongoose";
import isMongoId from "validator/lib/isMongoId";

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

export const AssignErpStatesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { state_ids, user_ids, flag } = req.body as {
        user_ids: string[],
        state_ids: string[],
        flag: number
    }
    if (state_ids && state_ids.length === 0)
        return res.status(400).json({ message: "please select one state " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one state owner" })

    let owners = user_ids

    if (flag == 0) {
        for (let i = 0; i < owners.length; i++) {
            let owner = await User.findById(owners[i]).populate('assigned_states');
            if (owner) {
                let oldstates = owner.assigned_states.map((item) => { return item._id.valueOf() });
                oldstates = oldstates.filter((item) => { return !state_ids.includes(item) });
                await User.findByIdAndUpdate(owner._id, {
                    assigned_states: oldstates
                })
            }
        }
    }
    else for (let k = 0; k < owners.length; k++) {
        const user = await User.findById(owners[k]).populate('assigned_states')
        if (user) {
            let assigned_states = user.assigned_states;
            for (let i = 0; i <= state_ids.length; i++) {
                if (!assigned_states.map(i => { return i._id.valueOf() }).includes(state_ids[i])) {
                    let state = await State.findById(state_ids[i]);
                    if (state)
                        assigned_states.push(state)
                }
            }

            user.assigned_states = assigned_states
            await user.save();
        }

    }

    return res.status(200).json({ message: "successfull" })
}
export const BulkCreateAndUpdateErpStatesFromExcel = async (req: Request, res: Response, next: NextFunction) => {
    let result: GetErpStateFromExcelDto[] = []
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
        let workbook_response: GetErpStateFromExcelDto[] = xlsx.utils.sheet_to_json(
            workbook.Sheets[workbook_sheet[0]]
        );
        if (workbook_response.length > 3000) {
            return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
        }

        for (let i = 0; i < workbook_response.length; i++) {
            let item = workbook_response[i]
            let state: string | null = item.state
            let apr: number | null = Number(item.apr)
            let may: number | null = Number(item.may)
            let jun: number | null = Number(item.jun)
            let jul: number | null = Number(item.jul)
            let aug: number | null = Number(item.aug)
            let sep: number | null = Number(item.sep)
            let oct: number | null = Number(item.oct)
            let nov: number | null = Number(item.nov)
            let dec: number | null = Number(item.dec)
            let jan: number | null = Number(item.jan)
            let feb: number | null = Number(item.feb)
            let mar: number | null = Number(item.mar)

            if (state) {
                if (item._id && isMongoId(item._id)) {
                    await State.findByIdAndUpdate(item._id, {
                        state: state,
                        apr: apr || 0,
                        may: may || 0,
                        jun: jun || 0,
                        jul: jul || 0,
                        aug: aug || 0,
                        sep: sep || 0,
                        oct: oct || 0,
                        nov: nov || 0,
                        dec: dec || 0,
                        jan: jan || 0,
                        feb: feb || 0,
                        mar: mar || 0,
                        created_by: req.user,
                        updated_by: req.user,
                        created_at: new Date(),
                        updated_at: new Date()
                    })
                    statusText = "updated"
                }

                if (!item._id || !isMongoId(item._id)) {
                    let oldstate = await State.findOne({ state: state })
                    if (!oldstate) {
                        await new State({
                            ...item,
                            _id: new mongoose.Types.ObjectId(),
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