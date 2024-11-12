import mongoose from "mongoose"
import { IKey } from "./keys";
import { IKeyCategory } from "./key-category";

export type IExcelDb = {
    key: IKey,
    category: IKeyCategory
} & {}

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

}, { strict: false }
);

export const ExcelDB = mongoose.model("ExcelDB", flexibleSchema)
