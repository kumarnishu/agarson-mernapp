import mongoose from "mongoose"
import { ICRMCity, ICRMState, IKeyCategory, IKey } from "../interfaces/AuthorizationInterface"


const CRMCitySchema = new mongoose.Schema<ICRMCity, mongoose.Model<ICRMCity, {}, {}>, {}>({
    city: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
    },
    alias1: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    alias2: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    state: {
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



const CRMStateSchema = new mongoose.Schema<ICRMState, mongoose.Model<ICRMState, {}, {}>, {}>({
    state: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required:true
    },
    alias1: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
    },
    alias2: {
        type: String,
        trim: true,
        index: true,
        lowercase: true
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




const KeySchema = new mongoose.Schema<IKey, mongoose.Model<IKey, {}, {}>, {}>({
    serial_no: {
        type: Number,
        index: true,
        required: true,
        default: 0
    },
    key: {
        type: String,
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
    is_date_key: {
        type: Boolean,
        default: false
    },
    map_to_username: {
        type: Boolean,
        default: false
    },
    map_to_state: {
        type: Boolean,
        default: false
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
export const KeyCategory = mongoose.model<IKeyCategory, mongoose.Model<IKeyCategory, {}, {}>>("KeyCategory", KeyCategorySchema)
export const CRMState = mongoose.model<ICRMState, mongoose.Model<ICRMState, {}, {}>>("CRMState", CRMStateSchema)

export const CRMCity = mongoose.model<ICRMCity, mongoose.Model<ICRMCity, {}, {}>>("CRMCity", CRMCitySchema)
