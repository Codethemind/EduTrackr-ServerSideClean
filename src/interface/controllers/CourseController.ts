import { Request, Response } from "express";
import { CourseUseCase } from "../../application/useCases/CourseUseCase";
import { Course } from "../../domain/entities/Course";
import { isValidObjectId } from "mongoose";

export class CourseController {
    constructor(private courseUseCase: CourseUseCase) {}

    async createCourse(req: Request, res: Response): Promise<Response> {
        try {
            const course = await this.courseUseCase.createCourse(req.body);
            return res.status(201).json({
                success: true,
                message: "Course created successfully",
                data: course
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to create course",
                error: error.message
            });
        }
    }

    async getCourseById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            const course = await this.courseUseCase.getCourseById(id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: course
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to get course",
                error: error.message
            });
        }
    }

    async getCoursesByDepartment(req: Request, res: Response): Promise<Response> {
        try {
            const { departmentId } = req.params;
            if (!isValidObjectId(departmentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            const courses = await this.courseUseCase.getCoursesByDepartment(departmentId);
            return res.status(200).json({
                success: true,
                data: courses
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to get courses",
                error: error.message
            });
        }
    }

    async updateCourse(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            const course = await this.courseUseCase.updateCourse(id, req.body);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Course updated successfully",
                data: course
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to update course",
                error: error.message
            });
        }
    }

    async deleteCourse(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            if (!isValidObjectId(id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            const deleted = await this.courseUseCase.deleteCourse(id);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Course deleted successfully"
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to delete course",
                error: error.message
            });
        }
    }

    async getAllCourses(_req: Request, res: Response): Promise<Response> {
        try {
            const courses = await this.courseUseCase.getAllCourses();
            return res.status(200).json({
                success: true,
                data: courses
            });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                message: "Failed to get courses",
                error: error.message
            });
        }
    }
} 