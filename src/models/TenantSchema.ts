import mongoose from "mongoose";


const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    domain: {
        type: String,
        unique: true
    },
    plan: {
        type: String,
        enum: ["free", "pro", "enterprise"],
        default: "free"
    },
}, { timestamps: true })


export default mongoose.models.Tenant || mongoose.model("Tenant", tenantSchema);