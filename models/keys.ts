import mongoose from "mongoose"
import { IUser } from "./user"
import { IKeyCategory } from "./key-category"


export type IKey = {
    _id: string,
    key: string,
    category: IKeyCategory,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const KeySchema = new mongoose.Schema<IKey, mongoose.Model<IKey, {}, {}>, {}>({
    key: {
        type: String,
        trim: true,
        index: true,
        required: true
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