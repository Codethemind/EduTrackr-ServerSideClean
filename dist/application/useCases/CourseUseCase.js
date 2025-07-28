"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseUseCase = void 0;
const Course_1 = require("../../domain/entities/Course");
const createHttpError_1 = require("../../common/utils/createHttpError");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const http_message_enum_1 = require("../../common/enums/http-message.enum");
class CourseUseCase {
    constructor(courseRepository) {
        this.courseRepository = courseRepository;
    }
    async createCourse(courseData) {
        if (!courseData.name || courseData.name.trim() === '') {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_NAME_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!courseData.code || courseData.code.trim() === '') {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_CODE_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const existingCourseByName = await this.courseRepository.findCourseByName(courseData.name.trim());
        if (existingCourseByName) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_NAME_EXISTS, http_status_enum_1.HttpStatus.CONFLICT);
        }
        const existingCourseByCode = await this.courseRepository.findCourseByCode(courseData.code.trim());
        if (existingCourseByCode) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_CODE_EXISTS, http_status_enum_1.HttpStatus.CONFLICT);
        }
        const course = Course_1.Course.create(courseData);
        return this.courseRepository.createCourse(course);
    }
    async updateCourse(id, courseData) {
        if (courseData.name && courseData.name.trim() !== '') {
            const existingCourseByName = await this.courseRepository.findCourseByName(courseData.name.trim());
            if (existingCourseByName && existingCourseByName._id !== id) {
                (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_NAME_EXISTS, http_status_enum_1.HttpStatus.CONFLICT);
            }
        }
        if (courseData.code && courseData.code.trim() !== '') {
            const existingCourseByCode = await this.courseRepository.findCourseByCode(courseData.code.trim());
            if (existingCourseByCode && existingCourseByCode._id !== id) {
                (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_CODE_EXISTS, http_status_enum_1.HttpStatus.CONFLICT);
            }
        }
        const sanitizedData = {
            ...courseData,
            ...(courseData.name && { name: courseData.name.trim() }),
            ...(courseData.code && { code: courseData.code.trim() }),
            ...(courseData.departmentId && { departmentId: courseData.departmentId.trim() }),
            ...(courseData.departmentName && { departmentName: courseData.departmentName.trim() }),
            updatedAt: new Date(),
        };
        return this.courseRepository.updateCourse(id, sanitizedData);
    }
    async getCourseById(id) {
        if (!id || id.trim() === '') {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_ID_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.courseRepository.findCourseById(id.trim());
    }
    async getCourseByCode(code) {
        if (!code || code.trim() === '') {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_CODE_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.courseRepository.findCourseByCode(code.trim());
    }
    async getCourseByName(name) {
        if (!name || name.trim() === '') {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_NAME_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.courseRepository.findCourseByName(name.trim());
    }
    async getCoursesByDepartment(departmentId) {
        if (!departmentId || departmentId.trim() === '') {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.DEPARTMENT_ID_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        return this.courseRepository.findCoursesByDepartment(departmentId.trim());
    }
    async deleteCourse(id) {
        if (!id || id.trim() === '') {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_ID_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const course = await this.courseRepository.findCourseById(id.trim());
        if (!course) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.CourseMessage.COURSE_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        }
        return this.courseRepository.deleteCourse(id.trim());
    }
    async getAllCourses() {
        return this.courseRepository.getAllCourses();
    }
}
exports.CourseUseCase = CourseUseCase;
//# sourceMappingURL=CourseUseCase.js.map