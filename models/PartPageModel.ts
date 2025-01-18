import mongoose from "mongoose";
import { IPartyRemark } from "../interfaces/PartyPageInterface";


const PartyRemarkSchema = new mongoose.Schema<IPartyRemark, mongoose.Model<IPartyRemark, {}, {}>, {}>({
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

export const PartyRemark = mongoose.model<IPartyRemark, mongoose.Model<IPartyRemark, {}, {}>>("PartyRemark", PartyRemarkSchema)
