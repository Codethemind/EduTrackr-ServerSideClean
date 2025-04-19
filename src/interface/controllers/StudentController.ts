// src/controllers/StudentController.ts

import { Request, Response } from "express";
import { StudentUseCase } from "../../application/useCases/studentUseCase";


export class StudentController {
  constructor(private studentUseCase: StudentUseCase) {}

  async createStudent(req: Request, res: Response): Promise<void> {
    console.log(req.body)
    try {
      const student = await this.studentUseCase.createStudent(req.body);
      res.status(201).json({ success: true, data: student });
    } catch (err: any) {
      console.error("Create Student Error:", err);
      res.status(500).json({ success: false, message: "Failed to create student", error: err.message });
    }
  }

//   async getStudentById(req: Request, res: Response): Promise<void> {
//     try {
//       const student = await this.studentUseCase.(req.params.id);
//       if (!student) {
//         res.status(404).json({ success: false, message: "Student not found" });
//       } else {
//         res.json({ success: true, data: student });
//       }
//     } catch (err: any) {
//       console.error("Get Student Error:", err);
//       res.status(500).json({ success: false, message: "Failed to fetch student", error: err.message });
//     }
//   }

  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const student = await this.studentUseCase.updateStudent(req.params.id, req.body);
      if (!student) {
        res.status(404).json({ success: false, message: "Student not found" });
      } else {
        res.json({ success: true, data: student });
      }
    } catch (err: any) {
      console.error("Update Student Error:", err);
      res.status(500).json({ success: false, message: "Failed to update student", error: err.message });
    }
  }

  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.studentUseCase.deleteStudent(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Student not found" });
      } else {
        res.json({ success: true, message: "Student deleted successfully" });
      }
    } catch (err: any) {
      console.error("Delete Student Error:", err);
      res.status(500).json({ success: false, message: "Failed to delete student", error: err.message });
    }
  }

  async getAllStudents(_req: Request, res: Response): Promise<void> {
    try {
      const students = await this.studentUseCase.getAllStudents();
      res.json({ success: true, data: students });
    } catch (err: any) {
      console.error("Get All Students Error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch students", error: err.message });
    }
  }
}
