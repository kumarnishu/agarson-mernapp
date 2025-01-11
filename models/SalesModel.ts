import mongoose from "mongoose";
import { IAgeingRemark, IAgeing, ICollection, ILeaveBalance, IReferenceRemark, IReference, ISales, IVisitRemark, IVisitReport } from "../interfaces/SalesInterface";


const AgeingRemarkSchema = new mongoose.Schema<IAgeingRemark, mongoose.Model<IAgeingRemark, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    party: { type: String, required: true },
    next_call: Date,
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




const AgeingSchema = new mongoose.Schema<IAgeing, mongoose.Model<IAgeing, {}, {}>, {}>({
    party: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    }
    ,
    next_call: Date,
    last_remark: String,
    state: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    two5: { type: Number, default: 0 },
    three0: { type: Number, default: 0 },
    five5: { type: Number, default: 0 },
    six0: { type: Number, default: 0 },
    seven0: { type: Number, default: 0 },
    seventyplus: { type: Number, default: 0 },
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




const LeaveSchema = new mongoose.Schema<ILeaveBalance, mongoose.Model<ILeaveBalance, {}, {}>, {}>({
    
    sl: {
        type: Number,
        default: 0,
        required: true
    },
    fl: {
        type: Number,
        default: 0,
        required: true
    },
    sw: {
        type: Number,
        default: 0,
        required: true
    },
    cl: {
        type: Number,
        default: 0,
        required: true
    },
    yearmonth: {
        type: Number,
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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


const ReferenceRemarkSchema = new mongoose.Schema<IReferenceRemark, mongoose.Model<IReferenceRemark, {}, {}>, {}>({
    party: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    next_call: Date,
    remark: {
        type: String,
        required: true,
        lowercase: true,
        index: true
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





const ReferenceSchema = new mongoose.Schema<IReference, mongoose.Model<IReference, {}, {}>, {}>({
    date: {
        type: Date,
        required: true
    },
    gst: {
        type: String,
        trim: true
    },
    party: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    }
    ,
    stage: {
        type: String,
        default: 'open',
        required: true
    },
    next_call: Date,
    last_remark: String,
    reference: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    state: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    address: String,
    pincode: Number,
    business: String,
    sale_scope: { type: Number, default: 0, required: true },
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




const VisitRemarkSchema = new mongoose.Schema<IVisitRemark, mongoose.Model<IVisitRemark, {}, {}>, {}>({
    remark: {
        type: String,
        lowercase: true,
        required: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    visit_date: Date,
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




const VisitReportSchema = new mongoose.Schema<IVisitReport, mongoose.Model<IVisitReport, {}, {}>, {}>({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customer: String,
    intime: Number,
    outtime: Number,
    visitInLocation: String,
    visitOutLocation: String,
    remarks: String,
    created_at: Date,
    visit_date: {
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

export const VisitReport = mongoose.model<IVisitReport, mongoose.Model<IVisitReport, {}, {}>>("VisitReport", VisitReportSchema)
export const VisitRemark = mongoose.model<IVisitRemark, mongoose.Model<IVisitRemark, {}, {}>>("VisitRemark", VisitRemarkSchema)
export const Sales = mongoose.model<ISales, mongoose.Model<ISales, {}, {}>>("Sales", SalesSchema)
export const Reference = mongoose.model<IReference, mongoose.Model<IReference, {}, {}>>("Reference", ReferenceSchema)
export const ReferenceRemark = mongoose.model<IReferenceRemark, mongoose.Model<IReferenceRemark, {}, {}>>("ReferenceRemark", ReferenceRemarkSchema)
export const LeaveBalance = mongoose.model<ILeaveBalance, mongoose.Model<ILeaveBalance, {}, {}>>("LeaveBalance", LeaveSchema)
export const Collection = mongoose.model<ICollection, mongoose.Model<ICollection, {}, {}>>("Collection", CollectionSchema)
export const Ageing = mongoose.model<IAgeing, mongoose.Model<IAgeing, {}, {}>>("Ageing", AgeingSchema)
export const AgeingRemark = mongoose.model<IAgeingRemark, mongoose.Model<IAgeingRemark, {}, {}>>("AgeingRemark", AgeingRemarkSchema)
