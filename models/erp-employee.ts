import mongoose from "mongoose"
import { IUser } from "../users/user.model"



export type IErpEmployee = {
    _id: string,
    name: string,
    display_name: string,
    created_at: Date,
    updated_at: Date,
    created_by: IUser,
    updated_by: IUser
}
const ErpEmployeeSchema = new mongoose.Schema<IErpEmployee, mongoose.Model<IErpEmployee, {}, {}>, {}>({
    name: {
        type: String,
        trim: true,
        required:true
    },
    display_name: {
        type: String,
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

export const ErpEmployee = mongoose.model<IErpEmployee, mongoose.Model<IErpEmployee, {}, {}>>("ErpEmployee", ErpEmployeeSchema)