import mongoose from "mongoose"
import { IUser } from "./user.model"

export type IAgeing = {
    _id: string,
    state: string,
    party: string,
    next_call: Date,
    last_remark: string,
    two5: number,
    three0: number,
    five5: number,
    six0: number,
    seven0: number,
    seventyplus: number,
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
    two5: { type: Number, default: 0 },
    three0: { type: Number, default: 0 },
    five5: { type: Number, default: 0 },
    six0: { type: Number, default: 0 },
    seven0: { type: Number, default: 0 },
    seventyplus: { type: Number, default: 0 },
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