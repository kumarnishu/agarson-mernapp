import mongoose from "mongoose"
import { IUser } from "../users/user.model"

export type IDyeLocation = {
    _id: string,
    name: string,
    active: boolean,
    display_name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const DyeLocationSchema = new mongoose.Schema<IDyeLocation, mongoose.Model<IDyeLocation, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    active: { type: Boolean, default: true },
    display_name: {
        type: String,
        required: true,
        trim: true
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

export const DyeLocation = mongoose.model<IDyeLocation, mongoose.Model<IDyeLocation, {}, {}>>("DyeLocation", DyeLocationSchema)