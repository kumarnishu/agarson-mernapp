import mongoose from "mongoose"
import { IArticle, IChecklistCategory, ICRMCity, ICRMState, IDye, IDyeLocation, IErpEmployee, ILeadSource, ILeadType, IMachine, IMachineCategory, IMaintenanceCategory, IStage, IState } from "../interfaces/dropdown.interface"



const CRMCitySchema = new mongoose.Schema<ICRMCity, mongoose.Model<ICRMCity, {}, {}>, {}>({
    city: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
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
const LeadTypeSchema = new mongoose.Schema<ILeadType, mongoose.Model<ILeadType, {}, {}>, {}>({
    type: {
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
const LeadSourceSchema = new mongoose.Schema<ILeadSource, mongoose.Model<ILeadSource, {}, {}>, {}>({
    source: {
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
const CRMStateSchema = new mongoose.Schema<ICRMState, mongoose.Model<ICRMState, {}, {}>, {}>({
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

const ArticleSchema = new mongoose.Schema<IArticle, mongoose.Model<IArticle, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    active: {
        type: Boolean,
        default: true
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
const MachineCategorySchema = new mongoose.Schema<IMachineCategory, mongoose.Model<IMachineCategory, {}, {}>, {}>({
    category: {
        type: String,
        required: true,
        lowercase: true,
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
const DyeLocationSchema = new mongoose.Schema<IDyeLocation, mongoose.Model<IDyeLocation, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    active: { type: Boolean, default: true },
   
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
const DyeSchema = new mongoose.Schema<IDye, mongoose.Model<IDye, {}, {}>, {}>({
    dye_number: {
        type: Number,
        required: true,
        trim: true
    },
    stdshoe_weight: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
    articles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }],
    active: {
        type: Boolean,
        default: true
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
const MachineSchema = new mongoose.Schema<IMachine, mongoose.Model<IMachine, {}, {}>, {}>({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },

    category: String,
    serial_no: { type: Number, default: 0 },
    active: {
        type: Boolean,
        default: true
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


const ErpEmployeeSchema = new mongoose.Schema<IErpEmployee, mongoose.Model<IErpEmployee, {}, {}>, {}>({
    name: {
        type: String,
        trim: true,
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


const MaintenanceCategorySchema = new mongoose.Schema<IMaintenanceCategory, mongoose.Model<IMaintenanceCategory, {}, {}>, {}>({
    category: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    active: {
        type: Boolean,
        default: true
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

const ChecklistCategorySchema = new mongoose.Schema<IChecklistCategory, mongoose.Model<IChecklistCategory, {}, {}>, {}>({
    category: {
        type: String,
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



export const Article = mongoose.model<IArticle, mongoose.Model<IArticle, {}, {}>>("Article", ArticleSchema)
export const MachineCategory = mongoose.model<IMachineCategory, mongoose.Model<IMachineCategory, {}, {}>>("MachineCategory", MachineCategorySchema)
export const CRMCity = mongoose.model<ICRMCity, mongoose.Model<ICRMCity, {}, {}>>("CRMCity", CRMCitySchema)
export const LeadType = mongoose.model<ILeadType, mongoose.Model<ILeadType, {}, {}>>("LeadType", LeadTypeSchema)
export const LeadSource = mongoose.model<ILeadSource, mongoose.Model<ILeadSource, {}, {}>>("LeadSource", LeadSourceSchema)
export const Stage = mongoose.model<IStage, mongoose.Model<IStage, {}, {}>>("Stage", StageSchema)
export const CRMState = mongoose.model<ICRMState, mongoose.Model<ICRMState, {}, {}>>("CRMState", CRMStateSchema)
export const DyeLocation = mongoose.model<IDyeLocation, mongoose.Model<IDyeLocation, {}, {}>>("DyeLocation", DyeLocationSchema)
export const Dye = mongoose.model<IDye, mongoose.Model<IDye, {}, {}>>("Dye", DyeSchema)
export const ErpEmployee = mongoose.model<IErpEmployee, mongoose.Model<IErpEmployee, {}, {}>>("ErpEmployee", ErpEmployeeSchema)
export const Machine = mongoose.model<IMachine, mongoose.Model<IMachine, {}, {}>>("Machine", MachineSchema)
export const MaintenanceCategory = mongoose.model<IMaintenanceCategory, mongoose.Model<IMaintenanceCategory, {}, {}>>("MaintenanceCategory", MaintenanceCategorySchema)
export const State = mongoose.model<IState, mongoose.Model<IState, {}, {}>>("State", StateSchema)
export const ChecklistCategory = mongoose.model<IChecklistCategory, mongoose.Model<IChecklistCategory, {}, {}>>("ChecklistCategory", ChecklistCategorySchema)
