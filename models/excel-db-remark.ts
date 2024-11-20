import mongoose from "mongoose";
import { IUser } from "./user";
import { IKeyCategory } from "./key-category";

export type IExcelDBRemark = {
    _id: string,
    remark: string,
    category:IKeyCategory,
    obj:string,
    created_at: Date,
    next_date:Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const ExcelDBRemarkSchema = new mongoose.Schema<IExcelDBRemark, mongoose.Model<IExcelDBRemark, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    obj: {
        type: String,
        lowercase: true,
        required: true
    },
    next_date:Date,
    created_at: {
        type: Date,
        default: new Date(),
        required: true,

    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KeyCategory',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updated_at: {
        type: Date,
        default: new Date(),
        required: true,

    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})


export const ExcelDBRemark = mongoose.model<IExcelDBRemark, mongoose.Model<IExcelDBRemark, {}, {}>>("ExcelDBRemark", ExcelDBRemarkSchema)
