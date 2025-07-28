"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schedule = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class Schedule {
    constructor(data) {
        this._id = data._id;
        this.departmentId = data.departmentId ?? new mongoose_1.default.Types.ObjectId();
        this.courseId = data.courseId ?? new mongoose_1.default.Types.ObjectId();
        this.teacherId = data.teacherId ?? new mongoose_1.default.Types.ObjectId();
        this.day = data.day ?? '';
        this.startTime = data.startTime ?? '';
        this.endTime = data.endTime ?? '';
        this.semester = data.semester ?? '';
        this.link = data.link ?? '';
        this.isLive = data.isLive ?? false;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}
exports.Schedule = Schedule;
exports.default = Schedule;
//# sourceMappingURL=Schedule.js.map