import { Request, Response, NextFunction } from "express"

export const requireRole = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req.user as { role: string };
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({ message: "Forbidden" });
            return
        }
        next();
    }
}