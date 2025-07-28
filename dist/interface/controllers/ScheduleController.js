"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const mongoose_1 = require("mongoose");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const createHttpError_1 = require("../../common/utils/createHttpError");
class ScheduleController {
    constructor(scheduleUseCase) {
        this.scheduleUseCase = scheduleUseCase;
    }
    async createSchedule(req, res, next) {
        try {
            const { departmentId, courseId, teacherId, day, startTime, endTime, semester } = req.body;
            if (!(0, mongoose_1.isValidObjectId)(departmentId) || !(0, mongoose_1.isValidObjectId)(courseId) || !(0, mongoose_1.isValidObjectId)(teacherId)) {
                return next((0, createHttpError_1.createHttpError)("Invalid department, course, or teacher ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            if (!day || !startTime || !endTime || !semester) {
                return next((0, createHttpError_1.createHttpError)("Missing required fields", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const schedule = await this.scheduleUseCase.createSchedule({ departmentId, courseId, teacherId, day, startTime, endTime, semester });
            res.status(http_status_enum_1.HttpStatus.CREATED).json({
                success: true,
                message: "Schedule created successfully",
                data: schedule,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findScheduleById(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return next((0, createHttpError_1.createHttpError)("Invalid schedule ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const schedule = await this.scheduleUseCase.findScheduleById(id);
            if (!schedule) {
                return next((0, createHttpError_1.createHttpError)("Schedule not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: schedule });
        }
        catch (error) {
            next(error);
        }
    }
    async updateSchedule(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return next((0, createHttpError_1.createHttpError)("Invalid schedule ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const updated = await this.scheduleUseCase.updateSchedule(id, req.body);
            if (!updated) {
                return next((0, createHttpError_1.createHttpError)("Schedule not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Schedule updated successfully",
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteSchedule(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return next((0, createHttpError_1.createHttpError)("Invalid schedule ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const deleted = await this.scheduleUseCase.deleteSchedule(id);
            if (!deleted) {
                return next((0, createHttpError_1.createHttpError)("Schedule not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: "Schedule deleted successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllSchedules(_req, res, next) {
        try {
            const schedules = await this.scheduleUseCase.getAllSchedules();
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: schedules });
        }
        catch (error) {
            next(error);
        }
    }
    async getSchedulesByDepartment(req, res, next) {
        try {
            const { departmentId } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(departmentId)) {
                return next((0, createHttpError_1.createHttpError)("Invalid department ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const schedules = await this.scheduleUseCase.getSchedulesByDepartment(departmentId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: schedules });
        }
        catch (error) {
            next(error);
        }
    }
    async getSchedulesByTeacher(req, res, next) {
        try {
            const { teacherId } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(teacherId)) {
                return next((0, createHttpError_1.createHttpError)("Invalid teacher ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const schedules = await this.scheduleUseCase.getSchedulesByTeacher(teacherId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, data: schedules });
        }
        catch (error) {
            next(error);
        }
    }
    async startLiveClass(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return next((0, createHttpError_1.createHttpError)("Invalid schedule ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const updated = await this.scheduleUseCase.startLiveClass(id);
            if (!updated) {
                return next((0, createHttpError_1.createHttpError)("Schedule not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Live class started",
                data: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ScheduleController = ScheduleController;
//# sourceMappingURL=ScheduleController.js.map