import mongoose from "mongoose";
import { optional, z } from "zod";

const userSchema = new mongoose.Schema({

    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tenant",
        require: true
    },
    name: String,
    email: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["admin", "sales", "manager"],
        default: "sales"
    },
    status: {
        type: String,
        enum: ["active", "suspended", "inactive"],
        optional: true
    },
    lastLoginAt: {
        type: Date
    },
    lastLoginIp: {
        type: String
    }
}, {
    timestamps: true
})

// // ✅ This prevents OverwriteModelError on hot reloads or multiple imports
export default mongoose.model("User", userSchema);


export const registerUserSchema = z.object({
    tenantId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid tenant ID"),
    name: z.string().min(2, "name is to short"),
    email: z.string().email('Invalid Email'),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[a-z]/, "Must include a lowercase letter")
        .regex(/[A-Z]/, "Must include an uppercase letter")
        .regex(/[0-9]/, "Must include a number"),
    role: z.enum(["admin", "sales", "manager"]).default("sales"),
    status: z.enum(["active", "suspended","inactive"]).optional(),
    lastLoginAt: z.date().optional(),
    lastLoginIp: z.string().optional(),
})