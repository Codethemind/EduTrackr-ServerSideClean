"use strict";
// src/domain/entities/Teacher.ts
Object.defineProperty(exports, "__esModule", { value: true });
class Teacher {
    constructor(data) {
        this.id = data.id;
        this.username = data.username ?? '';
        this.firstname = data.firstname ?? '';
        this.lastname = data.lastname ?? '';
        this.email = data.email ?? '';
        this.password = data.password ?? '';
        this.profileImage = data.profileImage;
        this.department = data.department ?? '';
        this.departmentName = data.departmentName;
        this.role = 'Teacher';
    }
}
exports.default = Teacher;
//# sourceMappingURL=Teacher.js.map