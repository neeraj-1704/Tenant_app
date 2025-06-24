import { Request, Response } from 'express';
import { createTenantSchema } from '../models/TenantSchema';
import Tenant from '../models/TenantSchema';


export const createTenant = async (req: Request, res: Response) => {
    try {
        // Validate input using Zod
        const parsed = createTenantSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                message: "Invalid request data",
                errors: parsed.error.flatten(),
            });
            return
        }
        const { name, email, domain, plan } = parsed.data;
        // Check for existing tenant by email or domain
        const existingTenant = await Tenant.findOne({
            $or: [{ email }, { domain }],
        });

        if (existingTenant) {
            res.status(409).json({
                message: "Email or domain already in use",
            });
            return
        }

        // Create tenant
        const newTenant = await Tenant.create({ name, email, domain, plan });
        res.status(201).json({
            message: "Tenant created successfully",
            tenant: newTenant,
        });
        return

    } catch (error) {
        console.error("Tenant creation failed:", error);
        res.status(500).json({
            message: "Internal server error",
        });
        return
    }
};
