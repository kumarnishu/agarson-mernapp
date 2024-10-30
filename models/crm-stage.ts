import mongoose from "mongoose"
import { IUser } from "../users/user.model"
export type IStage = {
    _id: string,
    stage: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const StageSchema = new mongoose.Schema<IStage, mongoose.Model<IStage, {}, {}>, {}>({
    stage: {
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

export const Stage = mongoose.model<IStage, mongoose.Model<IStage, {}, {}>>("Stage", StageSchema)