import mongoose from "mongoose"

const flexibleSchema = new mongoose.Schema({}, { strict: false });
const columnSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: "string" },
    created_at: {
        type: Date, default: new Date()
    }
})

export const SalesmanLeaves = mongoose.model("SalesmanLeaves", flexibleSchema)
export const SalesmanLeavesColumns = mongoose.model("SalesmanLeavesColumns", columnSchema)