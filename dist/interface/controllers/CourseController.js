"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const mongoose_1 = require("mongoose");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
class CourseController {
    constructor(courseUseCase) {
        this.courseUseCase = courseUseCase;
    }
    async createCourse(req, res, next) {
        try {
            const course = await this.courseUseCase.createCourse(req.body);
            res.status(http_status_enum_1.HttpStatus.CREATED).json({
                success: true,
                message: "Course created successfully",
                data: course
            });
        }
        catch (error) {
            console.error("Create course error:", error);
            next(error);
        }
    }
    async getCourseById(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid course ID" });
                return;
            }
            const course = await this.courseUseCase.getCourseById(id);
            if (!course) {
                res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({ success: false, message: "Course not found" });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: course });
        }
        catch (error) {
            console.error("Get course error:", error);
            next(error);
        }
    }
    async getCoursesByDepartment(req, res, next) {
        try {
            const { departmentId } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(departmentId)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid department ID" });
                return;
            }
            const courses = await this.courseUseCase.getCoursesByDepartment(departmentId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: courses });
        }
        catch (error) {
            console.error("Get courses by department error:", error);
            next(error);
        }
    }
    async updateCourse(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid course ID" });
                return;
            }
            const course = await this.courseUseCase.updateCourse(id, req.body);
            if (!course) {
                res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({ success: false, message: "Course not found" });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Course updated successfully",
                data: course
            });
        }
        catch (error) {
            console.error("Update course error:", error);
            next(error);
        }
    }
    async deleteCourse(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid course ID" });
                return;
            }
            const deleted = await this.courseUseCase.deleteCourse(id);
            if (!deleted) {
                res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({ success: false, message: "Course not found" });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Course deleted successfully"
            });
        }
        catch (error) {
            console.error("Delete course error:", error);
            next(error);
        }
    }
    async getAllCourses(_req, res, next) {
        try {
            const courses = await this.courseUseCase.getAllCourses();
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: courses });
        }
        catch (error) {
            console.error("Get all courses error:", error);
            next(error);
        }
    }
}
exports.CourseController = CourseController;
//# sourceMappingURL=CourseController.js.map