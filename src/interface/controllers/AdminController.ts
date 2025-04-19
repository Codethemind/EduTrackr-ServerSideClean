// src/controllers/AdminController.ts
import { Request, Response } from "express";
import { AdminUseCase } from "../../application/useCases/AdminUseCase";

export class AdminController {
    constructor(private adminUseCase: AdminUseCase) {}

    async createAdmin(req: Request, res: Response): Promise<void> {
        try {
            const admin = await this.adminUseCase.createAdmin(req.body);
            res.status(201).json({ success: true, data: admin });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to create admin", error: err.message });
        }
    }

    async findAdminById(req: Request, res: Response): Promise<void> {
        try {
            const admin = await this.adminUseCase.findAdminById(req.params.id);
            if (!admin) {
                res.status(404).json({ success: false, message: "Admin not found" });
                return;
            }
            res.status(200).json({ success: true, data: admin });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve admin", error: err.message });
        }
    }

    async updateAdmin(req: Request, res: Response): Promise<void> {
        try {
            const updatedAdmin = await this.adminUseCase.updateAdmin(req.params.id, req.body);
            if (!updatedAdmin) {
                res.status(404).json({ success: false, message: "Admin not found" });
                return;
            }
            res.status(200).json({ success: true, data: updatedAdmin });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to update admin", error: err.message });
        }
    }

    async deleteAdmin(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.adminUseCase.deleteAdmin(req.params.id);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Admin not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Admin deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to delete admin", error: err.message });
        }
    }

    async getAllAdmins(req: Request, res: Response): Promise<void> {
        try {
            const admins = await this.adminUseCase.getAllAdmins();
            res.status(200).json({ success: true, data: admins });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve admins", error: err.message });
        }
    }
}
