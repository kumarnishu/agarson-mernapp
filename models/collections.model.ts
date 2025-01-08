import mongoose from "mongoose"
import { IUser } from "./user.model"

export type ICollection = {
    _id: string,
    date: Date,
    party: string,
    state: string,
    amount:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const CollectionSchema = new mongoose.Schema<ICollection, mongoose.Model<ICollection, {}, {}>, {}>({
    date: {
        type: Date,
        required: true
    },
    party: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    }
    ,
    state: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    amount: {type:Number,default:0},
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

export const Collection = mongoose.model<ICollection, mongoose.Model<ICollection, {}, {}>>("Collection", CollectionSchema)