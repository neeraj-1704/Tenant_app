import express, { Response, Request } from "express";
import { Request as CoreRequest } from "express-serve-static-core";
import Lead from "../models/LeadSchema";
import { requireAuth } from "../middlewares/auth";
import mongoose from "mongoose";

const router = express.Router();


interface AuthenticatedRequest extends CoreRequest {
  user?: {
    id: string;
    tenantId: string;
  };
  body: {
    customerId: string;
    status: string;
    assignedTo: string;
    notes?: string[];
  };
}
// CREATE
export const leadController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId, status, assignedTo, notes } = req.body;

    // Validate tenant
    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ message: "Unauthorized: tenant ID not found" });
      return
    }

    // Validate required fields
    if (!customerId || !assignedTo || !status) {
      res.status(400).json({ message: "customerId, assignedTo, and status are required" });
      return
    }

    const tenantId = req.user.tenantId;

    const validStatuses = ["new", "qulified", "converted", "lost"];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid Lead status" })
    }

    const newLead = await Lead.create({
      tenantId,
      customerId,
      status,
      assignedTo,
      notes: Array.isArray(notes) ? notes : [], // Default to empty array
    });

    res.status(201).json({
      message: "Lead is Created Successfully",
      lead: newLead,
    });
    return

  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(500).json({ message: "Internal server error" });
    return
  }
};
// READ
export const getLead = async (req: AuthenticatedRequest, res: Response) => {
  // const leads = await Lead.find({ tenantId: req.user.tenantId });
  try {

    // Validate tenant
    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ message: "Unauthorized: tenant ID not found" });
      return
    }

    const filter: any = { tenantId: req.user.tenantId };
    const { status, assignedTo } = req.query;

    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const leads = await Lead.find({ filter });

    res.status(201).json({
      message: "Lead Details fetch successfully",
      leads
    })
    return

  } catch (error) {
    console.error("Error Getting lead:", error);
    res.status(500).json({ message: "Internal server error" });
    return
  }
};
// UPDATE
export const updateLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, notes } = req.body;

    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ message: "Unauthorized: tenant ID not found" });
      return
    }

    const tenantId = req.user.tenantId;

    const existingLead = await Lead.findOne({ _id: id, tenantId });

    if (!existingLead) {
      res.status(404).json({ message: "Lead not found or unauthorized" });
      return
    }

    // Update fields if they are provided
    const validStatuses = ["new", "qualified", "converted", "lost"];
    if (status && validStatuses.includes(status)) {
      existingLead.status = status as "new" | "qualified" | "converted" | "lost";
    }
    if (assignedTo) existingLead.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    if (notes && Array.isArray(notes)) existingLead.notes = notes;

    const updatedLead = await existingLead.save();

    res.status(200).json({
      message: "Lead updated successfully",
      lead: updatedLead
    });
    return

  } catch (error) {
    console.error("Error updating lead:", error);
    res.status(500).json({ message: "Internal server error" });
    return
  }
};
// DELETE
export const deleteLead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user || !req.user.tenantId) {
      res.status(401).json({ message: "Unauthorized: tenant ID not found" });
      return
    }

    const tenantId = req.user.tenantId;

    const lead = await Lead.findOneAndDelete({ _id: id, tenantId });

    if (!lead) {
      res.status(404).json({ message: "Lead not found or already deleted" });
      return
    }

    res.status(200).json({ message: "Lead deleted successfully" });
    return

  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Internal server error" });
    return
  }
};

