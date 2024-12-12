import mongoose from "mongoose"
import { Asset, IUser } from "./user.model"

export type IDriverSystem = {
    _id: string,
    date: Date,
    driver: IUser
    party: string,
    billno: string,
    marka: string,
    transport: string,
    location: string,
    photo: Asset,
    remarks: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser,
    status?: string
}
const DriverSystemSchema = new mongoose.Schema<IDriverSystem, mongoose.Model<IDriverSystem, {}, {}>, {}>({
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    party: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    billno: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },

    marka: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    transport: {
        type: String,
        lowercase: true,
        trim: true,
        required: true
    },
    photo: {
        _id: { type: String },
        filename: { type: String },
        public_url: { type: String },
        content_type: { type: String },
        size: { type: String },
        bucket: { type: String },
        created_at: Date,
    },
    location: String,
    remarks: String,
    created_at: Date,
    date: {
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

export const DriverSystem = mongoose.model<IDriverSystem, mongoose.Model<IDriverSystem, {}, {}>>("DriverSystem", DriverSystemSchema)