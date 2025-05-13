import { Request, Response } from "express";
import { DepartmentUseCase } from "../../application/useCases/DepartmentUseCase";
import { Department } from "../../domain/entities/Department";
import { isValidObjectId } from "mongoose";

export class DepartmentController {
    constructor(private departmentUseCase: DepartmentUseCase) {}

    async createDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const department = await this.departmentUseCase.createDepartment(req.body);
            return res.status(201).json({
                success: true,
                message: "Department created successfully",
                data: department
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to create department",
                error: error.message
            });
        }
    }

    async getDepartmentById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            const department = await this.departmentUseCase.getDepartmentById(id);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: department
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to get department",
                error: error.message
            });
        }
    }

    async updateDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            const department = await this.departmentUseCase.updateDepartment(id, req.body);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Department updated successfully",
                data: department
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to update department",
                error: error.message
            });
        }
    }

    async deleteDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            const deleted = await this.departmentUseCase.deleteDepartment(id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Department not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Department deleted successfully"
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete department",
                error: error.message
            });
        }
    }

    async getAllDepartments(_req: Request, res: Response): Promise<Response> {
        try {
            const departments = await this.departmentUseCase.getAllDepartments();
            return res.status(200).json({
                success: true,
                data: departments
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to get departments",
                error: error.message
            });
        }
    }
}
