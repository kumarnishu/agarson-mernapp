import { NextFunction, Request, Response } from 'express';
import isMongoId from 'validator/lib/isMongoId';
import { CreateOrEditExcelDbRemarkDto, GetExcelDBRemarksDto } from '../dtos';
import { ExcelDBRemark, IExcelDBRemark } from '../models/excel-db-remark';
import { KeyCategory } from '../models/key-category';
import moment from 'moment';


export const UpdateExcelDBRemark = async (req: Request, res: Response, next: NextFunction) => {
    const { remark } = req.body as CreateOrEditExcelDbRemarkDto
    if (!remark) return res.status(403).json({ message: "please fill required fields" })

    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ExcelDBRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    rremark.remark = remark
    await rremark.save()
    return res.status(200).json({ message: "remark updated successfully" })
}

export const DeleteExcelDBRemark = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
    let rremark = await ExcelDBRemark.findById(id)
    if (!rremark) {
        return res.status(404).json({ message: "remark not found" })
    }
    await rremark.remove()
    return res.status(200).json({ message: " remark deleted successfully" })
}


export const GetExcelDBRemarkHistory = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id; 
    let remarks: IExcelDBRemark[] = []
    let result: GetExcelDBRemarksDto[] = []

    if (!isMongoId(id)) return res.status(400).json({ message: "id not valid" })

    remarks = await ExcelDBRemark.find({ category: id }).populate('category').populate('created_by').sort('-created_at')

    result = remarks.map((r) => {
        return {
            _id: r._id,
            remark: r.remark,
            obj:r.obj,
            category: { id: r.category._id, value: r.category.category, label: r.category.category },
            next_date: r.next_date ? moment(r.next_date).format('DD/MM/YYYY') : "",
            created_date: r.created_at.toString(),
            created_by: r.created_by.username
        }
    })
    return res.json(result)
}

export const NewExcelDBRemark = async (req: Request, res: Response, next: NextFunction) => {
    const {
        remark,
        category,
        obj,
        next_date } = req.body as CreateOrEditExcelDbRemarkDto
    if (!remark || !category || !obj) return res.status(403).json({ message: "please fill required fields" })

    let categoryObj = await KeyCategory.findById(category)
    if (!category) {
        return res.status(404).json({ message: "category not found" })
    }

    let new_remark = new ExcelDBRemark({
        remark,
        obj,
        category: categoryObj,
        created_at: new Date(Date.now()),
        created_by: req.user,
        updated_at: new Date(Date.now()),
        updated_by: req.user
    })
    if (next_date)
        new_remark.next_date = new Date(next_date)
    await new_remark.save()
    return res.status(200).json({ message: "remark added successfully" })
}