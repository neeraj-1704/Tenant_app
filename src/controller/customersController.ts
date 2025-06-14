import { Request, Response } from "express";
import Customer from "../models/CustomerSchema";
import Tenant from "../models/TenantSchema";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
  };
}

// Create a customer
export const createCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, company } = req.body;

    if (!name || !email || !phone || !company) {
      res.status(400).json({ message: "All fields are required" });
      return
    }

    if (!req.user || !req.user.tenantId) {
      res.status(400).json({ message: "Tenant ID is missing" });
      return
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      tenantId: req.user.tenantId, // ✅ Properly set tenant ID from token
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ message: "Server error" });
    return
  }
};


// Get customers with pagination
export const getCustomers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.tenantId) {
      res.status(400).json({ message: "All fields are required" });
      return
    }

    const tenantId = req.user.tenantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      Customer.find({ tenantId }).skip(skip).limit(limit),
      Customer.countDocuments({ tenantId }),
    ]);

    res.json({
      data: customers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

    return
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a customer
export const updateCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.tenantId) {
      res.status(400).json({ message: "All fields are required" });
      return
    }

    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const customer = await Customer.findOneAndUpdate(
      { _id: id, tenantId },
      req.body,
      { new: true }
    );

    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return
    }

    res.json(customer);
    return
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a customer
export const deleteCustomer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user || !req.user.tenantId) {
      res.status(400).json({ message: "All fields are required" });
      return
    }

    const tenantId = req.user.tenantId;

    const customer = await Customer.findOneAndDelete({ _id: id, tenantId });

    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return
    }

    res.json({ message: "Customer deleted successfully" });
    return
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};
