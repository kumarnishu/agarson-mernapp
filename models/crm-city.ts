import mongoose from "mongoose"
import { IUser } from "../users/user.model"

export type ICRMCity = {
    _id: string,
    city: string,
    state: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const CRMCitySchema = new mongoose.Schema<ICRMCity, mongoose.Model<ICRMCity, {}, {}>, {}>({
    city: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
    },
    state: {
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

export const CRMCity = mongoose.model<ICRMCity, mongoose.Model<ICRMCity, {}, {}>>("CRMCity", CRMCitySchema)