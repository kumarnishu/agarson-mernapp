import mongoose from "mongoose"
import { IUser } from "./user.model"

export type IReference = {
    _id: string,
    gst: string,
    party: string,
    address: string,
    state: string,
    pincode: number,
    business: string,
    sale_scope: number,
    reference: string
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const ReferenceSchema = new mongoose.Schema<IReference, mongoose.Model<IReference, {}, {}>, {}>({
    gst: {
        type: String,
        trim: true
    },
    party: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    }
    ,
    reference: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    state: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    address: String,
    pincode: Number,
    business: String,
    sale_scope: { type: Number, default: 0, required: true },
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

export const Reference = mongoose.model<IReference, mongoose.Model<IReference, {}, {}>>("Reference", ReferenceSchema)