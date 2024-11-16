import mongoose from "mongoose"
import { IUser } from "./user"
import { IKeyCategory } from "./key-category"


export type IKey = {
    _id: string,
    serial_no: number,
    key: string,
    type: string,
    category: IKeyCategory,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const KeySchema = new mongoose.Schema<IKey, mongoose.Model<IKey, {}, {}>, {}>({
    serial_no: {
        type: Number,
        index: true,
        required: true,
        default:0
    },
    key: {
        type: String,
        trim: true,
        index: true,
        required: true
    },
    type: {
        type: String,
        lowercase: true,
        trim: true,
        default: 'string'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KeyCategory',
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

export const Key = mongoose.model<IKey, mongoose.Model<IKey, {}, {}>>("Key", KeySchema)