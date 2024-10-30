import mongoose from "mongoose"
import { IUser } from "../users/user.model"



export type IState = {
    _id: string,
    state: string,
    apr: number,
    may: number,
    jun: number,
    jul: number,
    aug: number,
    sep: number,
    oct: number,
    nov: number,
    dec: number,
    jan: number,
    feb: number,
    mar: number,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const StateSchema = new mongoose.Schema<IState, mongoose.Model<IState, {}, {}>, {}>({
    state: {
        type: String,
        trim: true,
    },
    apr: {
        type: Number, default: 0
    },
    may: {
        type: Number, default: 0
    },
    jun: {
        type: Number, default: 0
    },
    jul: {
        type: Number, default: 0
    },
    aug: {
        type: Number, default: 0
    },
    sep: {
        type: Number, default: 0
    },
    oct: {
        type: Number, default: 0
    },
    nov: {
        type: Number, default: 0
    },
    dec: {
        type: Number, default: 0
    },
    jan: {
        type: Number, default: 0
    },
    feb: {
        type: Number, default: 0
    },
    mar: {
        type: Number, default: 0
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

export const State = mongoose.model<IState, mongoose.Model<IState, {}, {}>>("State", StateSchema)