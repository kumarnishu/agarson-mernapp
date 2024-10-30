import mongoose from "mongoose"
import { IUser } from "../users/user.model"


export type IMachineCategory = {
    _id: string,
    category: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}


const MachineCategorySchema = new mongoose.Schema<IMachineCategory, mongoose.Model<IMachineCategory, {}, {}>, {}>({
    category: {
        type: String,
        required: true,
        lowercase:true,
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

export const MachineCategory = mongoose.model<IMachineCategory, mongoose.Model<IMachineCategory, {}, {}>>("MachineCategory", MachineCategorySchema)