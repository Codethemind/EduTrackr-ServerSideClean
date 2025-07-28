"use strict";
// core/domain/entities/Course.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
class Course {
    constructor(name, code, departmentId, semester, active = true, createdAt = new Date(), updatedAt = new Date(), departmentName, _id) {
        this.name = name;
        this.code = code;
        this.departmentId = departmentId;
        this.semester = semester;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.departmentName = departmentName;
        this._id = _id;
    }
    static create(data) {
        return new Course(data.name || '', data.code || '', data.departmentId || '', data.semester || 1, data.active, data.createdAt, data.updatedAt, data.departmentName, data._id);
    }
}
exports.Course = Course;
//# sourceMappingURL=Course.js.map