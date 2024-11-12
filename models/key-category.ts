import mongoose from "mongoose"
import { IUser } from "./user"


export type IKeyCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const KeyCategorySchema = new mongoose.Schema<IKeyCategory, mongoose.Model<IKeyCategory, {}, {}>, {}>({
    category: {
        type: String,
        trim: true,
        index: true,
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

export const KeyCategory = mongoose.model<IKeyCategory, mongoose.Model<IKeyCategory, {}, {}>>("KeyCategory", KeyCategorySchema)