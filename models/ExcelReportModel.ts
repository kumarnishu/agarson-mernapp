import mongoose from "mongoose";
import { IExcelDBRemark } from "../interfaces/ExcelReportInterface";

const ExcelDBRemarkSchema = new mongoose.Schema<IExcelDBRemark, mongoose.Model<IExcelDBRemark, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    obj: {
        type: String
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


const flexibleSchema = new mongoose.Schema({
    key: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Key',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KeyCategory',
        required: true
    },

}, { strict: false }
);

export const ExcelDB = mongoose.model("ExcelDB", flexibleSchema)

export const ExcelDBRemark = mongoose.model<IExcelDBRemark, mongoose.Model<IExcelDBRemark, {}, {}>>("ExcelDBRemark", ExcelDBRemarkSchema)