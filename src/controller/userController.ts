import express, { Request, Response } from "express";
import { registerUserSchema } from '../models/UserSchema'
import Tenant from "../models/TenantSchema"
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import Customer from '../models/CustomerSchema'
import User from '../models/UserSchema'
import { ParseStatus, z } from 'zod';
const JWT_SECRET = process.env.JWT_SECRET

// Zod validation for the login user
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

// Zod schema for query params
const paginationSchema = z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
});

export const loginUser = async (req: Request, res: Response) => {
    try {
        const parsed = loginSchema.parse(req.body);
        const { email, password } = parsed;
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
        // check for the active user
        if (user.status !== 'active') {
            res.status(403).json({
                message: "User is suspended not active"
            })
            return
        }
        console.log(user.tenantId)
        // Get tenant info
        const tenant = await Tenant.findById(user.tenantId);
        console.log(tenant)

        if (!tenant) {
            res.status(404).json({
                message: "Tenant not found"
            })
        }

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
        const tenantId = (req.user as { tenantId: string }).tenantId; // From auth middleware
        const parsed = paginationSchema.parse(req.query)
        const page = parseInt(parsed.page);
        const limit = parseInt(parsed.limit);

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find({ tenantId }).select("-password").skip(skip).limit(limit),
            User.countDocuments({ tenantId }),
        ])

        res.status(200).json({
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

// with zod validations 
export const createUser = async (req: Request, res: Response) => {
    try {
        if (!req.body) {
            res.status(400).json({
                message: "please Enter the data"
            })
            return
        }
        const parsed = registerUserSchema.parse(req.body);

        const { tenantId, name, email, password, role, status } = parsed;

        // Step 2: Check if user already exists
        const existingUser = await User.findOne({ email, tenantId });

        if (existingUser) {
            res.status(404).json({
                message: "Email already in use"
            })
            return
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        //Check if tenant exists or create a new one
        let tenant = await Tenant.findOne({ name: name });
        if (tenant) {
            res.status(409).json({
                message: "Tenant not found"
            })
            return
        }

        // Step 4: Create and save user
        const newUser = new User({
            ...parsed,
            password: hashedPassword,
        });

        await newUser.save();

        // Step 5: Respond
        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                status: newUser.status,
                tenantId: newUser.tenantId,
                createdAt: newUser.createdAt,
            },
        })
    } catch (error) {
        console.error(error);
        if (error instanceof Error && "errors" in error) {
            res.status(400).json({ errors: (error as any).errors });
            return
        }
        res.status(500).json({ message: "Registration failed" });
    }

}