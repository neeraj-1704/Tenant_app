import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend the Request type (if not done globally)
declare module "express-serve-static-core" {
    interface Request {
        user?: any;
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    console.log("Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No or malformed token" });
        return
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = payload; // Example: { userId, tenantId, role }
        next();
    } catch (err) {
        console.error("JWT verification failed:", err);
        res.status(403).json({ message: "Invalid or expired token" });
        return
    }
};
