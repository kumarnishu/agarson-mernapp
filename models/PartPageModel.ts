import mongoose from "mongoose";
import { IParty, IPartyRemark, ISampleSystem } from "../interfaces/PartyPageInterface";



const PartySchema = new mongoose.Schema<IParty, mongoose.Model<IParty, {}, {}>, {}>({
    party: { type: String, required: true },
    mobile: String,
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

export const Party = mongoose.model<IParty, mongoose.Model<IParty, {}, {}>>("Party", PartySchema)

const SampleSystemSchema = new mongoose.Schema<ISampleSystem, mongoose.Model<ISampleSystem, {}, {}>, {}>({
    date: { type: Date, required: true },
    party: { type: String, required: true },
    state: { type: String, required: true },
    samples: { type: String, required: true },
    stage: { type: String, required: true, default: 'pending' },
    last_remark: {
        type: String,
        lowercase: true
    },
    otherparty: { type: Boolean, default: false },
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

export const SampleSystem = mongoose.model<ISampleSystem, mongoose.Model<ISampleSystem, {}, {}>>("SampleSystem", SampleSystemSchema)


const PartyRemarkSchema = new mongoose.Schema<IPartyRemark, mongoose.Model<IPartyRemark, {}, {}>, {}>({
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

export const PartyRemark = mongoose.model<IPartyRemark, mongoose.Model<IPartyRemark, {}, {}>>("PartyRemark", PartyRemarkSchema)
