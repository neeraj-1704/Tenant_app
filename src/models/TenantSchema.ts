import mongoose from "mongoose";
import { z } from "zod";

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


export default mongoose.model("Tenant", tenantSchema);

export const createTenantSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    domain: z.string().min(2, "Domain is too short"),
    plan: z.enum(["free", "pro", "enterprise"]).default("free"),
});
