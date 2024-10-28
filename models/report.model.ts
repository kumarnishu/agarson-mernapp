import mongoose from "mongoose"
import { IBillsAgingReport, IClientSaleLastYearReport, IClientSaleReport, IPartyTargetReport, IPendingOrdersReport, IVisitReport } from "../interfaces/report.interface"

const BillsAgingReportSchema = new mongoose.Schema<IBillsAgingReport, mongoose.Model<IBillsAgingReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    plu70: Number,
    in70to90: Number,
    in90to120: Number,
    plus120: Number,
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
const ClientSaleReportSchema = new mongoose.Schema<IClientSaleReport, mongoose.Model<IClientSaleReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    article: String,
    oldqty: { type: Number, default: 0 },
    newqty: { type: Number, default: 0 },
    apr: { type: Number, default: 0 },
    may: { type: Number, default: 0 },
    jun: { type: Number, default: 0 },
    jul: { type: Number, default: 0 },
    aug: { type: Number, default: 0 },
    sep: { type: Number, default: 0 },
    oct: { type: Number, default: 0 },
    nov: { type: Number, default: 0 },
    dec: { type: Number, default: 0 },
    jan: { type: Number, default: 0 },
    feb: { type: Number, default: 0 },
    mar: { type: Number, default: 0 },
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
const ClientSaleLastYearReportSchema = new mongoose.Schema<IClientSaleLastYearReport, mongoose.Model<IClientSaleLastYearReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    article: String,
    oldqty: { type: Number, default: 0 },
    newqty: { type: Number, default: 0 },
    apr: { type: Number, default: 0 },
    may: { type: Number, default: 0 },
    jun: { type: Number, default: 0 },
    jul: { type: Number, default: 0 },
    aug: { type: Number, default: 0 },
    sep: { type: Number, default: 0 },
    oct: { type: Number, default: 0 },
    nov: { type: Number, default: 0 },
    dec: { type: Number, default: 0 },
    jan: { type: Number, default: 0 },
    feb: { type: Number, default: 0 },
    mar: { type: Number, default: 0 },
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
const PartyTargetReportSchema = new mongoose.Schema<IPartyTargetReport, mongoose.Model<IPartyTargetReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    slno: String,
    PARTY: String,
    Create_Date: String,
    STATION: String,
    SALES_OWNER: String,
    All_TARGET: String,
    TARGET: { type: Number, default: 0 },
    PROJECTION: { type: Number, default: 0 },
    GROWTH: { type: Number, default: 0 },
    TARGET_ACHIEVE: String,
    TOTAL_SALE_OLD: { type: Number, default: 0 },
    TOTAL_SALE_NEW: { type: Number, default: 0 },
    Last_Apr: { type: Number, default: 0 },
    Cur_Apr: { type: Number, default: 0 },
    Last_May: { type: Number, default: 0 },
    Cur_May: { type: Number, default: 0 },
    Last_Jun: { type: Number, default: 0 },
    Cur_Jun: { type: Number, default: 0 },
    Last_Jul: { type: Number, default: 0 },
    Cur_Jul: { type: Number, default: 0 },
    Last_Aug: { type: Number, default: 0 },
    Cur_Aug: { type: Number, default: 0 },
    Last_Sep: { type: Number, default: 0 },
    Cur_Sep: { type: Number, default: 0 },
    Last_Oct: { type: Number, default: 0 },
    Cur_Oct: { type: Number, default: 0 },
    Last_Nov: { type: Number, default: 0 },
    Cur_Nov: { type: Number, default: 0 },
    Last_Dec: { type: Number, default: 0 },
    Cur_Dec: { type: Number, default: 0 },
    Last_Jan: { type: Number, default: 0 },
    Cur_Jan: { type: Number, default: 0 },
    Last_Feb: { type: Number, default: 0 },
    Cur_Feb: { type: Number, default: 0 },
    Last_Mar: { type: Number, default: 0 },
    Cur_Mar: { type: Number, default: 0 },
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
const PendingOrdersReportSchema = new mongoose.Schema<IPendingOrdersReport, mongoose.Model<IPendingOrdersReport, {}, {}>, {}>({
    report_owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State'
    },
    account: String,
    product_family: String,
    article: String,
    size5: { type: Number, default: 0 },
    size6: { type: Number, default: 0 },
    size7: { type: Number, default: 0 },
    size8: { type: Number, default: 0 },
    size9: { type: Number, default: 0 },
    size10: { type: Number, default: 0 },
    size11: { type: Number, default: 0 },
    size12_24pairs: { type: Number, default: 0 },
    size13: { type: Number, default: 0 },
    size11x12: { type: Number, default: 0 },
    size3: { type: Number, default: 0 },
    size4: { type: Number, default: 0 },
    size6to10: { type: Number, default: 0 },
    size7to10: { type: Number, default: 0 },
    size8to10: { type: Number, default: 0 },
    size4to8: { type: Number, default: 0 },
    size6to9: { type: Number, default: 0 },
    size5to8: { type: Number, default: 0 },
    size6to10A: { type: Number, default: 0 },
    size7to10B: { type: Number, default: 0 },
    size6to9A: { type: Number, default: 0 },
    size11close: { type: Number, default: 0 },
    size11to13: { type: Number, default: 0 },
    size3to8: { type: Number, default: 0 },
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
        ref: 'ErpEmployee'
    },
    customer: String,
    intime: String,
    outtime: String,
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


export const BillsAgingReport = mongoose.model<IBillsAgingReport, mongoose.Model<IBillsAgingReport, {}, {}>>("BillsAgingReport", BillsAgingReportSchema)
export const ClientSaleLastYearReport = mongoose.model<IClientSaleLastYearReport, mongoose.Model<IClientSaleLastYearReport, {}, {}>>("ClientSaleLastYearReport", ClientSaleLastYearReportSchema)
export const ClientSaleReport = mongoose.model<IClientSaleReport, mongoose.Model<IClientSaleReport, {}, {}>>("ClientSaleReport", ClientSaleReportSchema)
export const PartyTargetReport = mongoose.model<IPartyTargetReport, mongoose.Model<IPartyTargetReport, {}, {}>>("PartyTargetReport", PartyTargetReportSchema)
export const PendingOrdersReport = mongoose.model<IPendingOrdersReport, mongoose.Model<IPendingOrdersReport, {}, {}>>("PendingOrdersReport", PendingOrdersReportSchema)
export const VisitReport = mongoose.model<IVisitReport, mongoose.Model<IVisitReport, {}, {}>>("VisitReport", VisitReportSchema)
