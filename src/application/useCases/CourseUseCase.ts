import { ICourseRepository } from "../Interfaces/ICourseRepository";
import { Course } from "../../domain/entities/Course";

export class CourseUseCase {
    constructor(private courseRepository: ICourseRepository) {}

    async createCourse(courseData: Partial<Course>): Promise<Course> {
        // Validate input data
        if (!courseData.name || courseData.name.trim() === '') {
            throw new Error('Course name is required and cannot be empty');
        }
        
        if (!courseData.code || courseData.code.trim() === '') {
            throw new Error('Course code is required and cannot be empty');
        }

        // Check if course name already exists
        const existingCourseByName = await this.courseRepository.findCourseByName(courseData.name.trim());
        if (existingCourseByName) {
            throw new Error('Course with this name already exists');
        }

        // Check if course code already exists
        const existingCourseByCode = await this.courseRepository.findCourseByCode(courseData.code.trim());
        if (existingCourseByCode) {
            throw new Error('Course with this code already exists');
        }

        const course = Course.create(courseData);
        return this.courseRepository.createCourse(course);
    }

    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
        // If updating name or code, check for duplicates (excluding current course)
        if (courseData.name && courseData.name.trim() !== '') {
            const existingCourseByName = await this.courseRepository.findCourseByName(courseData.name.trim());
            if (existingCourseByName && existingCourseByName._id !== id) {
                throw new Error('Course with this name already exists');
            }
        }

        if (courseData.code && courseData.code.trim() !== '') {
            const existingCourseByCode = await this.courseRepository.findCourseByCode(courseData.code.trim());
            if (existingCourseByCode && existingCourseByCode._id !== id) {
                throw new Error('Course with this code already exists');
            }
        }

        // Trim string fields before updating
        const sanitizedData = {
            ...courseData,
            ...(courseData.name && { name: courseData.name.trim() }),
            ...(courseData.code && { code: courseData.code.trim() }),
            ...(courseData.departmentId && { departmentId: courseData.departmentId.trim() }),
            ...(courseData.departmentName && { departmentName: courseData.departmentName.trim() }),
            updatedAt: new Date()
        };

        return this.courseRepository.updateCourse(id, sanitizedData);
    }

    async getCourseById(id: string): Promise<Course | null> {
        if (!id || id.trim() === '') {
            throw new Error('Course ID is required');
        }
        return this.courseRepository.findCourseById(id.trim());
    }

    async getCourseByCode(code: string): Promise<Course | null> {
        if (!code || code.trim() === '') {
            throw new Error('Course code is required');
        }
        return this.courseRepository.findCourseByCode(code.trim());
    }

    async getCourseByName(name: string): Promise<Course | null> {
        if (!name || name.trim() === '') {
            throw new Error('Course name is required');
        }
        return this.courseRepository.findCourseByName(name.trim());
    }

    async getCoursesByDepartment(departmentId: string): Promise<Course[]> {
        if (!departmentId || departmentId.trim() === '') {
            throw new Error('Department ID is required');
        }
        return this.courseRepository.findCoursesByDepartment(departmentId.trim());
    }

    async deleteCourse(id: string): Promise<boolean> {
        if (!id || id.trim() === '') {
            throw new Error('Course ID is required');
        }
        
        const course = await this.courseRepository.findCourseById(id.trim());
        if (!course) {
            throw new Error('Course not found');
        }
        
        return this.courseRepository.deleteCourse(id.trim());
    }

    async getAllCourses(): Promise<Course[]> {
        return this.courseRepository.getAllCourses();
    }
}
