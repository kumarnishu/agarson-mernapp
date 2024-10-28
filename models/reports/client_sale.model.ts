import mongoose from "mongoose"
import { IState } from "../dropdown/state.model"
import { IUser } from "../features/user.model"


export type IClientSaleLastYearReport = {
    _id: string,
    report_owner: IState
    account: string,
    article: string,
    oldqty: number,
    newqty: number,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}
export type IClientSaleReport = {
    _id: string,
    report_owner: IState
    account: string,
    article: string,
    oldqty: number,
    newqty: number,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}

const ClientSaleReportSchema = new mongoose.Schema<IClientSaleReport, mongoose.Model<IClientSaleReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    article: String,
    oldqty: {type:Number,default:0},
    newqty: {type:Number,default:0},
    apr: {type:Number,default:0},
    may: {type:Number,default:0},
    jun: {type:Number,default:0},
    jul: {type:Number,default:0},
    aug: {type:Number,default:0},
    sep: {type:Number,default:0},
    oct: {type:Number,default:0},
    nov: {type:Number,default:0},
    dec: {type:Number,default:0},
    jan: {type:Number,default:0},
    feb: {type:Number,default:0},
    mar: {type:Number,default:0},
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

const ClientSaleLastYearReportSchema = new mongoose.Schema<IClientSaleLastYearReport, mongoose.Model<IClientSaleLastYearReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    article: String,
    oldqty: { type: Number, default: 0 },
    newqty: { type: Number, default: 0 },
    apr: { type: Number, default: 0 },
    may: { type: Number, default: 0 },
    jun: { type: Number, default: 0 },
    jul: { type: Number, default: 0 },
    aug: { type: Number, default: 0 },
    sep: { type: Number, default: 0 },
    oct: { type: Number, default: 0 },
    nov: { type: Number, default: 0 },
    dec: { type: Number, default: 0 },
    jan: { type: Number, default: 0 },
    feb: { type: Number, default: 0 },
    mar: { type: Number, default: 0 },
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

export const ClientSaleLastYearReport = mongoose.model<IClientSaleLastYearReport, mongoose.Model<IClientSaleLastYearReport, {}, {}>>("ClientSaleLastYearReport", ClientSaleLastYearReportSchema)

export const ClientSaleReport = mongoose.model<IClientSaleReport, mongoose.Model<IClientSaleReport, {}, {}>>("ClientSaleReport", ClientSaleReportSchema)
