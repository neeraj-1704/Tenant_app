  import mongoose from "mongoose";

  const customerSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true },
    name: String,
    email: String,
    phone: String,
    company: String,
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  }, { timestamps: true });

  export default mongoose.models.Customer || mongoose.model("Customer", customerSchema);
