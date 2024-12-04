import mongoose from "mongoose"
import { IDye } from "./dye.model"
import { IDyeLocation } from "./dye-location.model"
import { Asset, IUser } from "./user.model"

export type ISpareDye = {
    _id: string,
    dye: IDye,
    repair_required: boolean,
    dye_photo: Asset,
    remarks: string,
    is_validated: boolean,
    photo_time: Date,
    location: IDyeLocation,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const SpareDyeSchema = new mongoose.Schema<ISpareDye, mongoose.Model<ISpareDye, {}, {}>, {}>({

    dye: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dye',
        required: true
    },
    repair_required: { type: Boolean, default: false },
    remarks: { type: String, default: "" },
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DyeLocation'
    },
    is_validated: { type: Boolean, default: false },
    dye_photo: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    photo_time: Date,
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

export const SpareDye = mongoose.model<ISpareDye, mongoose.Model<ISpareDye, {}, {}>>("SpareDye", SpareDyeSchema)