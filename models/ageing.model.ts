import mongoose from "mongoose"
import { IUser } from "./user.model"

export type IAgeing = {
    _id: string,
    state: string,
    party: string,
    next_call: Date,
    last_remark: string,
    '25': number,
    '30': number,
    '55': number,
    '60': number,
    '70': number,
    '90': number,
    '120+': number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const AgeingSchema = new mongoose.Schema<IAgeing, mongoose.Model<IAgeing, {}, {}>, {}>({
    party: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    }
    ,
    next_call: Date,
    last_remark: String,
    state: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    '25': { type: Number, default: 0 },
    '30': { type: Number, default: 0 },
    '55': { type: Number, default: 0 },
    '60': { type: Number, default: 0 },
    '70': { type: Number, default: 0 },
    '90': { type: Number, default: 0 },
    '120+': { type: Number, default: 0 },
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

export const Ageing = mongoose.model<IAgeing, mongoose.Model<IAgeing, {}, {}>>("Ageing", AgeingSchema)