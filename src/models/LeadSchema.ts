// models/Lead.ts
import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  status: { type: String, enum: ["new", "qualified", "converted", "lost"], default: "new" },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  notes: [{ type: String }],

}, {
  timestamps: true
});

export default  mongoose.models.Lead || mongoose.model("Lead", leadSchema);
