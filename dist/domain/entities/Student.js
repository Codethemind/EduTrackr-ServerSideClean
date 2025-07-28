"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Student domain entity
class Student {
    constructor(data) {
        this._id = data._id;
        this.username = data.username ?? '';
        this.firstname = data.firstname ?? '';
        this.lastname = data.lastname ?? '';
        this.email = data.email ?? '';
        this.password = data.password ?? '';
        this.isBlock = data.isBlock ?? false;
        this.profileImage = data.profileImage;
        this.departmentId = data.departmentId ?? '';
        this.departmentName = data.departmentName;
        this.class = data.class ?? '';
        this.courses = data.courses ?? [];
        this.role = 'Student';
    }
}
exports.default = Student;
//# sourceMappingURL=Student.js.map