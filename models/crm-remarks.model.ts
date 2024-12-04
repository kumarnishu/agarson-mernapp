import mongoose from "mongoose"
import { ILead } from "./lead.model"
import { IReferredParty } from "./refer.model"
import { IUser } from "./user.model"

    
export type IRemark = {
    _id: string,
    remark: string,
    lead: ILead,
    refer:IReferredParty,
    created_at: Date,
    remind_date: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const RemarkSchema = new mongoose.Schema<IRemark, mongoose.Model<IRemark, {}, {}>, {}>({
    remark: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    remind_date: {
        type: Date,
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
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    refer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReferredParty'
    }
})

export const Remark = mongoose.model<IRemark, mongoose.Model<IRemark, {}, {}>>("Remark", RemarkSchema)