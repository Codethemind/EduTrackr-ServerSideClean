import { Request, Response } from "express";
import { CourseUseCase } from "../../application/useCases/CourseUseCase";
import { Course } from "../../domain/entities/Course";
import { isValidObjectId } from "mongoose";
import { HttpStatus } from '../../common/enums/http-status.enum';

export class CourseController {
    constructor(private courseUseCase: CourseUseCase) {}

    async createCourse(req: Request, res: Response): Promise<Response> {
        try {
            const course = await this.courseUseCase.createCourse(req.body);
            return res.status(HttpStatus.CREATED).json({
                success: true,
                message: "Course created successfully",
                data: course
            });
        } catch (error: any) {
            console.error('Create course error:', error);
            
            // Handle validation errors with BAD_REQUEST status
            if (this.isValidationError(error.message)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: error.message
                });
            }
            
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            const course = await this.courseUseCase.getCourseById(id);
            if (!course) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Course not found"
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                data: course
            });
        } catch (error: any) {
            console.error('Get course error:', error);
            
            if (this.isValidationError(error.message)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: error.message
                });
            }
            
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            const courses = await this.courseUseCase.getCoursesByDepartment(departmentId);
            return res.status(HttpStatus.OK).json({
                success: true,
                data: courses
            });
        } catch (error: any) {
            console.error('Get courses by department error:', error);
            
            if (this.isValidationError(error.message)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: error.message
                });
            }
            
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            const course = await this.courseUseCase.updateCourse(id, req.body);
            if (!course) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Course not found"
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: "Course updated successfully",
                data: course
            });
        } catch (error: any) {
            console.error('Update course error:', error);
            
            // Handle validation errors with BAD_REQUEST status
            if (this.isValidationError(error.message)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: error.message
                });
            }
            
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
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
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid course ID"
                });
            }

            const deleted = await this.courseUseCase.deleteCourse(id);
            if (!deleted) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Course not found"
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: "Course deleted successfully"
            });
        } catch (error: any) {
            console.error('Delete course error:', error);
            
            if (this.isValidationError(error.message)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: error.message
                });
            }
            
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to delete course",
                error: error.message
            });
        }
    }

    async getAllCourses(_req: Request, res: Response): Promise<Response> {
        try {
            const courses = await this.courseUseCase.getAllCourses();
            return res.status(HttpStatus.OK).json({
                success: true,
                data: courses
            });
        } catch (error: any) {
            console.error('Get all courses error:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to get courses",
                error: error.message
            });
        }
    }

    // Helper method to identify validation errors
    private isValidationError(message: string): boolean {
        const validationKeywords = [
            'required',
            'cannot be empty',
            'already exists',
            'must be a positive number',
            'not found',
            'invalid',
            'Department ID is required',
            'Course ID is required',
            'Course name is required',
            'Course code is required',
            'Semester must be'
        ];
        
        return validationKeywords.some(keyword => 
            message.toLowerCase().includes(keyword.toLowerCase())
        );
    }
}