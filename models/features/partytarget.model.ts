import mongoose from "mongoose"
import { IUser } from "./user.model"
import { IState } from "../dropdown/state.model"

export type IPartyTargetReport = {
    _id: string,
    slno: string,
    PARTY: string,
    Create_Date: string,
    STATION: string,
    SALES_OWNER: string,
    report_owner: IState
    All_TARGET: string,
    TARGET: number,
    PROJECTION: number,
    GROWTH: number,
    TARGET_ACHIEVE: number,
    TOTAL_SALE_OLD: number,
    TOTAL_SALE_NEW: number,
    Last_Apr: number,
    Cur_Apr: number,
    Last_May: number,
    Cur_May: number,
    Last_Jun: number,
    Cur_Jun: number,
    Last_Jul: number,
    Cur_Jul: number,
    Last_Aug: number,
    Cur_Aug: number,
    Last_Sep: number,
    Cur_Sep: number,
    Last_Oct: number,
    Cur_Oct: number,
    Last_Nov: number,
    Cur_Nov: number,
    Last_Dec: number,
    Cur_Dec: number,
    Last_Jan: number,
    Cur_Jan: number,
    Last_Feb: number,
    Cur_Feb: number,
    Last_Mar: number,
    Cur_Mar: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}

const PartyTargetReportSchema = new mongoose.Schema<IPartyTargetReport, mongoose.Model<IPartyTargetReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    slno: String,
    PARTY: String,
    Create_Date: String,
    STATION: String,
    SALES_OWNER: String,
    All_TARGET: String,
    TARGET: { type: Number, default: 0 },
    PROJECTION: { type: Number, default: 0 },
    GROWTH: { type: Number, default: 0 },
    TARGET_ACHIEVE: String,
    TOTAL_SALE_OLD: { type: Number, default: 0 },
    TOTAL_SALE_NEW: { type: Number, default: 0 },
    Last_Apr: { type: Number, default: 0 },
    Cur_Apr: { type: Number, default: 0 },
    Last_May: { type: Number, default: 0 },
    Cur_May: { type: Number, default: 0 },
    Last_Jun: { type: Number, default: 0 },
    Cur_Jun: { type: Number, default: 0 },
    Last_Jul: { type: Number, default: 0 },
    Cur_Jul: { type: Number, default: 0 },
    Last_Aug: { type: Number, default: 0 },
    Cur_Aug: { type: Number, default: 0 },
    Last_Sep: { type: Number, default: 0 },
    Cur_Sep: { type: Number, default: 0 },
    Last_Oct: { type: Number, default: 0 },
    Cur_Oct: { type: Number, default: 0 },
    Last_Nov: { type: Number, default: 0 },
    Cur_Nov: { type: Number, default: 0 },
    Last_Dec: { type: Number, default: 0 },
    Cur_Dec: { type: Number, default: 0 },
    Last_Jan: { type: Number, default: 0 },
    Cur_Jan: { type: Number, default: 0 },
    Last_Feb: { type: Number, default: 0 },
    Cur_Feb: { type: Number, default: 0 },
    Last_Mar: { type: Number, default: 0 },
    Cur_Mar: { type: Number, default: 0 },
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

export const PartyTargetReport = mongoose.model<IPartyTargetReport, mongoose.Model<IPartyTargetReport, {}, {}>>("PartyTargetReport", PartyTargetReportSchema)