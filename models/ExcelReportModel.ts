import mongoose from "mongoose";

const flexibleSchema = new mongoose.Schema({
    key: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Key',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KeyCategory',
        required: true
    },

}, 
{ strict: false }
);

export const ExcelDB = mongoose.model("ExcelDB", flexibleSchema)

