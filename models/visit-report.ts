import mongoose from "mongoose"
import { IErpEmployee } from "./erp-employee"
import { IUser } from "./user"

export type IVisitReport = {
    _id: string,
    employee: IErpEmployee
    visit_date:Date,
    customer:string,
    intime:string,
    outtime:string,
    visitInLocation: string,
    visitOutLocation: string,
    remarks:string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}
const VisitReportSchema = new mongoose.Schema<IVisitReport, mongoose.Model<IVisitReport, {}, {}>, {}>({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ErpEmployee'
    },
    customer: String,
    intime: String,
    outtime: String,
    visitInLocation: String,
    visitOutLocation: String,
    remarks: String,
    created_at: Date,
    visit_date: {
        type: Date,
        default: new Date(),
        required: true,

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

export const VisitReport = mongoose.model<IVisitReport, mongoose.Model<IVisitReport, {}, {}>>("VisitReport", VisitReportSchema)