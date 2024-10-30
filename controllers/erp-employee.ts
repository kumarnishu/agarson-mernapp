import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import { CreateOrEditErpEmployeeDto, GetErpEmployeeDto } from "../dtos";
import { ErpEmployee } from "../models/erp-employee";
import { User } from "../models/user";
import moment from "moment";
import isMongoId from "validator/lib/isMongoId";

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


export const AssignErpEmployeesToUsers = async (req: Request, res: Response, next: NextFunction) => {
    const { emp_ids, user_ids, flag } = req.body as {
        user_ids: string[],
        emp_ids: string[],
        flag: number
    }
    if (emp_ids && emp_ids.length === 0)
        return res.status(400).json({ message: "please select one employee " })
    if (user_ids && user_ids.length === 0)
        return res.status(400).json({ message: "please select one user" })

    let owners = user_ids

    if (flag == 0) {
        for (let i = 0; i < owners.length; i++) {
            let owner = await User.findById(owners[i]).populate('assigned_erpEmployees');
            if (owner) {
                let oldemps = owner.assigned_erpEmployees.map((item) => { return item._id.valueOf() });
                oldemps = oldemps.filter((item) => { return !emp_ids.includes(item) });
                await User.findByIdAndUpdate(owner._id, {
                    assigned_erpEmployees: oldemps
                })
            }
        }
    }
    else for (let k = 0; k < owners.length; k++) {
        const user = await User.findById(owners[k]).populate('assigned_erpEmployees')
        if (user) {
            let assigned_erpEmployees = user.assigned_erpEmployees;
            for (let i = 0; i <= emp_ids.length; i++) {
                if (!assigned_erpEmployees.map(i => { return i._id.valueOf() }).includes(emp_ids[i])) {
                    let emp = await ErpEmployee.findById(emp_ids[i]);
                    if (emp)
                        assigned_erpEmployees.push(emp)
                }
            }

            user.assigned_erpEmployees = assigned_erpEmployees
            await user.save();
        }

    }

    return res.status(200).json({ message: "successfull" })
}