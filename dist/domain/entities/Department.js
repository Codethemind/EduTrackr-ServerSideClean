"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Department = void 0;
class Department {
    constructor(name, code, establishedDate, headOfDepartment, departmentEmail, departmentPhone, active = true, createdAt = new Date(), updatedAt = new Date(), _id) {
        this.name = name;
        this.code = code;
        this.establishedDate = establishedDate;
        this.headOfDepartment = headOfDepartment;
        this.departmentEmail = departmentEmail;
        this.departmentPhone = departmentPhone;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this._id = _id;
    }
    static create(data) {
        return new Department(data.name || '', data.code || '', data.establishedDate || new Date(), data.headOfDepartment || '', data.departmentEmail || '', data.departmentPhone || '', data.active, data.createdAt, data.updatedAt, data._id);
    }
}
exports.Department = Department;
//# sourceMappingURL=Department.js.map