import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';

import moment from "moment";
import { GetMachineDto, CreateOrEditMachineDto } from "../dtos/machine.dto";
import { IMachine, Machine } from "../models/machine.model";

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