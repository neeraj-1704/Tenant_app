import express, { Request, Response } from "express";
import {registerUserSchema} from '../models/UserSchema'
import Tenant from "../models/TenantSchema"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import Customer from '../models/CustomerSchema'

const JWT_SECRET = process.env.JWT_SECRET
export const createUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, companyName } = req.body;

        // Check if email already exists
        //console.log(req.body)
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            res.status(400).json({
                message: "Email already in use"
            })
            return
        }

        //Check if tenant exists or create a new one
        let tenant = await Tenant.findOne({ name: companyName });
        if (!tenant) {
            // Generate a basic domain using company name
            const domain = `${companyName.toLowerCase().replace(/\s+/g, '-')}.example.com`;

            tenant = await Tenant.create({ name: companyName, plan: "free", domain })
        }

        // pass hask
        const hashPassword = await bcrypt.hash(password, 10);

        // create user 
        const user = await User.create({
            name,
            email,
            password: hashPassword,
            tenantId: tenant._id,
            role: "sales",

        })
        // res
        res.status(201).json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: tenant._id,
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed" });
    }

}
// routes/auth.ts (add this below the register route)
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid email or password" });
            return
        }

        // Check password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            res.status(400).json({ message: "Invalid email or password" });
            return
        }

        // 
        console.log(user.tenantId)
        // Get tenant info
        const tenant = await Tenant.findById(user.tenantId);
        console.log(tenant)
        // Sign JWT
        const token = jwt.sign(
            {
                userId: user._id,
                tenantId: user.tenantId, 
                role: user.role,
            },
            JWT_SECRET!,   //That ! is called a non-null assertion operator in TypeScript.
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                tenant: tenant?.name,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Login failed" });
    }
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const tenantId = req.user.tenanatId;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const skip = (page - 1) * limit;

        const [customer, total] = await Promise.all([
            Customer.find({ tenantId }).skip(skip).limit(limit),
            Customer.countDocuments({ tenantId }),
        ])

        res.status(200).json({
            data: customer,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch customers" });
    }
}