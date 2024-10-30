import mongoose from "mongoose"
import { IUser } from "../users/user.model"
export type ILeadSource = {
    _id: string,
    source: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const LeadSourceSchema = new mongoose.Schema<ILeadSource, mongoose.Model<ILeadSource, {}, {}>, {}>({
    source: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
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

export const LeadSource = mongoose.model<ILeadSource, mongoose.Model<ILeadSource, {}, {}>>("LeadSource", LeadSourceSchema)