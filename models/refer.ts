import mongoose from "mongoose"
import { IUser } from "../users/user.model"


export type IReferredParty = {
    _id: string,
    name: string,
    customer_name: string,
    mobile: string,
    mobile2: string,
    mobile3: string,
    address: string,
    last_remark: string,
    uploaded_bills: number,
    refers:number,
    gst: string,
    city: string,
    state: string,
    convertedfromlead: boolean,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}



const ReferredPartySchema = new mongoose.Schema<IReferredParty, mongoose.Model<IReferredParty, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    customer_name: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    uploaded_bills: {
        type: Number,
        default: 0
    },
    refers: {
        type: Number,
        default: 0
    },
    last_remark: {
        type: String,
        trim: true,
    },
    gst: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true
    },
    mobile2: {
        type: String,
        trim: true,
        index: true,
        lowercase: true
    },
    mobile3: {
        type: String,
        trim: true,
        index: true,
        lowercase: true
    },
    city: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    address: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    convertedfromlead: { type: Boolean, default: false },
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

export const ReferredParty = mongoose.model<IReferredParty, mongoose.Model<IReferredParty, {}, {}>>("ReferredParty", ReferredPartySchema)