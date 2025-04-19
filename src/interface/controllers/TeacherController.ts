// src/controllers/TeacherController.ts
import { Request, Response } from "express"
import { TeacherUseCase } from "../../application/useCases/TeacherUseCase";

export class TeacherController {
    constructor(private teacherUseCase: TeacherUseCase) {}

    async createTeacher(req: Request, res: Response): Promise<void> {
      
        try {
            console.log(req.body)
            const teacher = await this.teacherUseCase.createTeacher(req.body);
            res.status(201).json({ success: true, data: teacher });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to create teacher", error: err.message });
        }
    }

    async findTeacherById(req: Request, res: Response): Promise<void> {
        try {
            const teacher = await this.teacherUseCase.findTeacherById(req.params.id);
            if (!teacher) {
                res.status(404).json({ success: false, message: "Teacher not found" });
                return;
            }
            res.status(200).json({ success: true, data: teacher });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve teacher", error: err.message });
        }
    }

    async updateTeacher(req: Request, res: Response): Promise<void> {
        try {
            const updatedTeacher = await this.teacherUseCase.updateTeacher(req.params.id, req.body);
            if (!updatedTeacher) {
                res.status(404).json({ success: false, message: "Teacher not found" });
                return;
            }
            res.status(200).json({ success: true, data: updatedTeacher });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to update teacher", error: err.message });
        }
    }

    async deleteTeacher(req: Request, res: Response): Promise<void> {
        try {
            const deleted = await this.teacherUseCase.deleteTeacher(req.params.id);
            if (!deleted) {
                res.status(404).json({ success: false, message: "Teacher not found" });
                return;
            }
            res.status(200).json({ success: true, message: "Teacher deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to delete teacher", error: err.message });
        }
    }

    async getAllTeachers(req: Request, res: Response): Promise<void> {
        try {
            const teachers = await this.teacherUseCase.getAllTeachers();
            res.status(200).json({ success: true, data: teachers });
        } catch (err: any) {
            res.status(500).json({ success: false, message: "Failed to retrieve teachers", error: err.message });
        }
    }
}
