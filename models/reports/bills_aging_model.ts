import mongoose from "mongoose"
import { IState } from "../dropdown/state.model"
import { IUser } from "../features/user.model"


export type IBillsAgingReport = {
    _id: string,
    report_owner: IState
    account: string,
    plu70: number,
    in70to90: number,
    in90to120: number,
    plus120: number
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}
const BillsAgingReportSchema = new mongoose.Schema<IBillsAgingReport, mongoose.Model<IBillsAgingReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    plu70: Number,
    in70to90: Number,
    in90to120: Number,
    plus120: Number,
    created_at: {
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

export const BillsAgingReport = mongoose.model<IBillsAgingReport, mongoose.Model<IBillsAgingReport, {}, {}>>("BillsAgingReport", BillsAgingReportSchema)