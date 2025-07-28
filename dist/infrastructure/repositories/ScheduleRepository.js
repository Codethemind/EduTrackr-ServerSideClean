"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleRepository = void 0;
const ScheduleModel_1 = require("../models/ScheduleModel");
const Schedule_1 = __importDefault(require("../../domain/entities/Schedule"));
class ScheduleRepository {
    async createSchedule(schedule) {
        const scheduleDoc = new ScheduleModel_1.ScheduleModel(schedule);
        const savedDoc = await scheduleDoc.save();
        return new Schedule_1.default({
            ...savedDoc.toObject(),
            _id: savedDoc._id
        });
    }
    async findScheduleById(id) {
        const doc = await ScheduleModel_1.ScheduleModel.findById(id)
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return doc ? new Schedule_1.default({ ...doc.toObject(), _id: doc._id }) : null;
    }
    async updateSchedule(id, scheduleData) {
        const doc = await ScheduleModel_1.ScheduleModel.findByIdAndUpdate(id, scheduleData, { new: true })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return doc ? new Schedule_1.default({ ...doc.toObject(), _id: doc._id }) : null;
    }
    async deleteSchedule(id) {
        const result = await ScheduleModel_1.ScheduleModel.findByIdAndDelete(id);
        return !!result;
    }
    async getAllSchedules() {
        const docs = await ScheduleModel_1.ScheduleModel.find()
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule_1.default({ ...doc.toObject(), _id: doc._id }));
    }
    async getSchedulesByDepartment(departmentId) {
        const docs = await ScheduleModel_1.ScheduleModel.find({ departmentId })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule_1.default({ ...doc.toObject(), _id: doc._id }));
    }
    async getSchedulesByTeacher(teacherId) {
        const docs = await ScheduleModel_1.ScheduleModel.find({ teacherId })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule_1.default({ ...doc.toObject(), _id: doc._id }));
    }
    async findSchedulesByTeacherAndDay(teacherId, day) {
        const docs = await ScheduleModel_1.ScheduleModel.find({ teacherId, day })
            .populate('departmentId')
            .populate('courseId')
            .populate('teacherId');
        return docs.map(doc => new Schedule_1.default({ ...doc.toObject(), _id: doc._id }));
    }
}
exports.ScheduleRepository = ScheduleRepository;
//# sourceMappingURL=ScheduleRepository.js.map