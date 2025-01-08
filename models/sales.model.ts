import mongoose from "mongoose"
import { IUser } from "./user.model"

export type ISales = {
    _id: string,
    date: Date,
    invoice_no: string,
    party: string,
    state: string,
    amount:number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}

const SalesSchema = new mongoose.Schema<ISales, mongoose.Model<ISales, {}, {}>, {}>({
    date: {
        type: Date,
        required: true
    },
    invoice_no: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
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

export const Sales = mongoose.model<ISales, mongoose.Model<ISales, {}, {}>>("Sales", SalesSchema)