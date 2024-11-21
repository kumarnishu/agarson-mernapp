import mongoose from "mongoose"
import { IUser } from "./user"


export type IKeyCategory = {
    _id: string,
    category: string,
    display_name:string,
    skip_bottom_rows:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const KeyCategorySchema = new mongoose.Schema<IKeyCategory, mongoose.Model<IKeyCategory, {}, {}>, {}>({
    category: {
        type: String,
        index: true,
        required: true
    },
    display_name:{
        type: String,
        index: true,
    },
    skip_bottom_rows: {
        type: Number,
        index: true,
        required: true,
        default: 0
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