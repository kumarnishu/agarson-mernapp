import mongoose from "mongoose";
import { IUser } from "./user.model";

export type IAgeing = {
    _id: string,
    remark: string,
    next_call: Date,
    party: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const AgeingSchema = new mongoose.Schema<IAgeing, mongoose.Model<IAgeing, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    party: { type: String, required: true },
    next_call: Date,
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
