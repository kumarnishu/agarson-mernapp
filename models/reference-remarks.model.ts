import mongoose from "mongoose"
import { IUser } from "./user.model"

export type IReferenceRemark = {
    _id: string,
    party: string,
    reference: string,
    remark: string,
    next_call: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const ReferenceRemarkSchema = new mongoose.Schema<IReferenceRemark, mongoose.Model<IReferenceRemark, {}, {}>, {}>({
    party: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    next_call: Date,
    remark: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
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

export const ReferenceRemark = mongoose.model<IReferenceRemark, mongoose.Model<IReferenceRemark, {}, {}>>("ReferenceRemark", ReferenceRemarkSchema)