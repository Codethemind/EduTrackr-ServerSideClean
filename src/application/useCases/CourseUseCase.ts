import { ICourseRepository } from "../Interfaces/ICourseRepository";
import { Course } from "../../domain/entities/Course";

export class CourseUseCase {
    constructor(private courseRepository: ICourseRepository) {}

    async createCourse(courseData: Partial<Course>): Promise<Course> {
        const course = Course.create(courseData);
        return this.courseRepository.createCourse(course);
    }

    async getCourseById(id: string): Promise<Course | null> {
        return this.courseRepository.findCourseById(id);
    }

    async getCourseByCode(code: string): Promise<Course | null> {
        return this.courseRepository.findCourseByCode(code);
    }

    async getCoursesByDepartment(departmentId: string): Promise<Course[]> {
        return this.courseRepository.findCoursesByDepartment(departmentId);
    }

    async updateCourse(id: string, courseData: Partial<Course>): Promise<Course | null> {
        return this.courseRepository.updateCourse(id, courseData);
    }

    async deleteCourse(id: string): Promise<boolean> {
        return this.courseRepository.deleteCourse(id);
    }

    async getAllCourses(): Promise<Course[]> {
        return this.courseRepository.getAllCourses();
    }
} 