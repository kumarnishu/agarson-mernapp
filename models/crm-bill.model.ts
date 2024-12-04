import mongoose from "mongoose"
import { ILead } from "./lead.model"
import { IReferredParty } from "./refer.model"
import { Asset, IUser } from "./user.model"

export type IBill = {
    _id: string,
    lead: ILead,
    billphoto: Asset,
    refer: IReferredParty,
    bill_no: string,
    remarks:string,
    bill_date: Date,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const BillSchema = new mongoose.Schema<IBill, mongoose.Model<IBill, {}, {}>, {}>({
    bill_no: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    billphoto: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date
    },
    remarks: {
        type: String,
        required: true,
        trim: true,
        index: true,
        lowercase: true,
    },
    bill_date: {
        type: Date,
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

export const Bill = mongoose.model<IBill, mongoose.Model<IBill, {}, {}>>("Bill", BillSchema)