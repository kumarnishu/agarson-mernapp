import mongoose from "mongoose"
import { IState } from "../dropdown/state.model"
import { IUser } from "../features/user.model"

export type IPendingOrdersReport = {
    _id: string,
    report_owner: IState
    account: string,
    product_family: string,
    article: string,
    size5: number,
    size6: number,
    size7: number,
    size8: number,
    size9: number,
    size10: number,
    size11: number,
    size12_24pairs: number,
    size13: number,
    size11x12: number,
    size3: number,
    size4: number,
    size6to10: number,
    size7to10: number,
    size8to10: number,
    size4to8: number,
    size6to9: number,
    size5to8: number,
    size6to10A: number,
    size7to10B: number,
    size6to9A: number,
    size11close: number,
    size11to13: number,
    size3to8: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}
const PendingOrdersReportSchema = new mongoose.Schema<IPendingOrdersReport, mongoose.Model<IPendingOrdersReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    product_family: String,
    article: String,
    size5: { type: Number, default: 0 },
    size6: { type: Number, default: 0 },
    size7: { type: Number, default: 0 },
    size8: { type: Number, default: 0 },
    size9: { type: Number, default: 0 },
    size10: { type: Number, default: 0 },
    size11: { type: Number, default: 0 },
    size12_24pairs: { type: Number, default: 0 },
    size13: { type: Number, default: 0 },
    size11x12: { type: Number, default: 0 },
    size3: { type: Number, default: 0 },
    size4: { type: Number, default: 0 },
    size6to10: { type: Number, default: 0 },
    size7to10: { type: Number, default: 0 },
    size8to10: { type: Number, default: 0 },
    size4to8: { type: Number, default: 0 },
    size6to9: { type: Number, default: 0 },
    size5to8: { type: Number, default: 0 },
    size6to10A: { type: Number, default: 0 },
    size7to10B: { type: Number, default: 0 },
    size6to9A: { type: Number, default: 0 },
    size11close: { type: Number, default: 0 },
    size11to13: { type: Number, default: 0 },
    size3to8: { type: Number, default: 0 },
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

export const PendingOrdersReport = mongoose.model<IPendingOrdersReport, mongoose.Model<IPendingOrdersReport, {}, {}>>("PendingOrdersReport", PendingOrdersReportSchema)