"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleUseCase = void 0;
const Schedule_1 = __importDefault(require("../../domain/entities/Schedule"));
const createHttpError_1 = require("../../common/utils/createHttpError");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
class ScheduleUseCase {
    constructor(scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }
    async createSchedule(scheduleData) {
        if (!this.isValidTimeFormat(scheduleData.startTime) ||
            !this.isValidTimeFormat(scheduleData.endTime)) {
            throw (0, createHttpError_1.createHttpError)('Invalid time format (HH:MM required)', http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!this.isValidTimeRange(scheduleData.startTime, scheduleData.endTime)) {
            throw (0, createHttpError_1.createHttpError)('End time must be after start time', http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const conflict = await this.checkTimeConflicts(scheduleData);
        if (conflict) {
            throw (0, createHttpError_1.createHttpError)(`Time slot conflicts with existing schedule for teacher ${conflict.teacherId.toString()} on ${conflict.day} from ${conflict.startTime} to ${conflict.endTime}`, http_status_enum_1.HttpStatus.CONFLICT);
        }
        return await this.scheduleRepository.createSchedule(new Schedule_1.default(scheduleData));
    }
    async findScheduleById(id) {
        return await this.scheduleRepository.findScheduleById(id);
    }
    async updateSchedule(id, updateData) {
        if (updateData.startTime && !this.isValidTimeFormat(updateData.startTime)) {
            throw (0, createHttpError_1.createHttpError)('Invalid start time format (HH:MM required)', http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (updateData.endTime && !this.isValidTimeFormat(updateData.endTime)) {
            throw (0, createHttpError_1.createHttpError)('Invalid end time format (HH:MM required)', http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (updateData.startTime && updateData.endTime &&
            !this.isValidTimeRange(updateData.startTime, updateData.endTime)) {
            throw (0, createHttpError_1.createHttpError)('End time must be after start time', http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const conflict = await this.checkTimeConflicts(updateData, id);
        if (conflict) {
            throw (0, createHttpError_1.createHttpError)(`Time slot conflicts with existing schedule for teacher ${conflict.teacherId.toString()} on ${conflict.day} from ${conflict.startTime} to ${conflict.endTime}`, http_status_enum_1.HttpStatus.CONFLICT);
        }
        return await this.scheduleRepository.updateSchedule(id, updateData);
    }
    async deleteSchedule(id) {
        return await this.scheduleRepository.deleteSchedule(id);
    }
    async getAllSchedules() {
        return await this.scheduleRepository.getAllSchedules();
    }
    async getSchedulesByDepartment(departmentId) {
        return await this.scheduleRepository.getSchedulesByDepartment(departmentId);
    }
    async getSchedulesByTeacher(teacherId) {
        return await this.scheduleRepository.getSchedulesByTeacher(teacherId);
    }
    async startLiveClass(scheduleId) {
        return await this.scheduleRepository.updateSchedule(scheduleId, { isLive: true });
    }
    isValidTimeFormat(time) {
        if (!time)
            return false;
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    isValidTimeRange(startTime, endTime) {
        if (!startTime || !endTime)
            return true;
        const startMinutes = this.toMinutes(startTime);
        const endMinutes = this.toMinutes(endTime);
        return endMinutes > startMinutes;
    }
    toMinutes(time) {
        const [hour, minute] = time.trim().split(':').map(Number);
        return hour * 60 + minute;
    }
    async checkTimeConflicts(scheduleData, excludeId) {
        const { day, startTime, endTime, teacherId } = scheduleData;
        if (!day || !startTime || !endTime || !teacherId) {
            return false;
        }
        const existingSchedules = await this.scheduleRepository.findSchedulesByTeacherAndDay(teacherId.toString(), day);
        const newStart = this.toMinutes(startTime);
        const newEnd = this.toMinutes(endTime);
        for (const schedule of existingSchedules) {
            if (excludeId && schedule._id?.toString() === excludeId) {
                continue;
            }
            const existingStart = this.toMinutes(schedule.startTime);
            const existingEnd = this.toMinutes(schedule.endTime);
            const hasOverlap = (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd);
            if (hasOverlap) {
                return schedule; // Return the conflicting schedule for detailed error message
            }
        }
        return false;
    }
}
exports.ScheduleUseCase = ScheduleUseCase;
//# sourceMappingURL=ScheduleUseCase.js.map