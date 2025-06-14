import Task from "../models/TaskSchema";
import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
    user?: {
        tenantId: string;
        id?: string;
    };
}

// CREATE Task
export const createTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.tenantId) {
            res.status(401).json({ message: "Unauthorized: tenant ID not found" });
            return
        }

        const { title, dueDate, assignedTo, customerId, status } = req.body;

        if (!title || !dueDate || !assignedTo || !customerId) {
            res.status(400).json({ message: "All required fields must be provided" });
            return
        }

        const task = await Task.create({
            title,
            dueDate,
            assignedTo,
            customerId,
            status: status || "pending",
            tenantId: req.user.tenantId,
        });

        res.status(201).json({
            message: "Task created successfully",
            task,
        });
        return
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

// READ All Tasks
export const getTasks = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user?.tenantId) {
            res.status(401).json({ message: "Unauthorized: tenant ID not found" });
            return
        }

        const tasks = await Task.find({ tenantId: req.user.tenantId });

        res.status(200).json({
            message: "Tasks fetched successfully",
            tasks,
        });
        return
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

// READ Single Task (optional)
export const getTaskById = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user?.tenantId) {
            res.status(401).json({ message: "Unauthorized: tenant ID not found" });
            return
        }

        const task = await Task.findOne({ _id: id, tenantId: req.user.tenantId });

        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return
        }

        return res.status(200).json({ task });
    } catch (error) {
        console.error("Error fetching task:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

// UPDATE Task
export const updateTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user?.tenantId) {
            res.status(401).json({ message: "Unauthorized: tenant ID not found" });
            return
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, tenantId: req.user.tenantId },
            { $set: req.body },
            { new: true }
        );


        if (!updatedTask) {
            res.status(404).json({ message: "Task not found or unauthorized" });
            return
        }

        // return res.status(200).json(...);
        // Which technically returns a Response object, but Express types expect your controller to return nothing (void).
        // return after the object return

        res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask,
        });
        return
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};

// DELETE Task
export const deleteTask = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (!req.user?.tenantId) {
            res.status(401).json({ message: "Unauthorized: tenant ID not found" });
            return
        }

        const task = await Task.findOneAndDelete({ _id: id, tenantId: req.user.tenantId });
        if (!task) {
            res.status(404).json({ message: "Task not found or already deleted" });
            return
        }
        res.status(200).json({ message: "Task deleted successfully" });
        return
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ message: "Internal server error" });
        return
    }
};
