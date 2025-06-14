// models/Task.ts
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
  title: String,
  dueDate: Date,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },

}, {
  timestamps: true
});

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
