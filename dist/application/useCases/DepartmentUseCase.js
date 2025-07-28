"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentUseCase = void 0;
const Department_1 = require("../../domain/entities/Department");
class DepartmentUseCase {
    constructor(departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    async createDepartment(departmentData) {
        const department = Department_1.Department.create(departmentData);
        return this.departmentRepository.createDepartment(department);
    }
    async getDepartmentById(id) {
        return this.departmentRepository.findDepartmentById(id);
    }
    async getDepartmentByCode(code) {
        return this.departmentRepository.findDepartmentByCode(code);
    }
    async getDepartmentByEmail(email) {
        return this.departmentRepository.findDepartmentByEmail(email);
    }
    async updateDepartment(id, departmentData) {
        return this.departmentRepository.updateDepartment(id, departmentData);
    }
    async deleteDepartment(id) {
        return this.departmentRepository.deleteDepartment(id);
    }
    async getAllDepartments() {
        return this.departmentRepository.getAllDepartments();
    }
}
exports.DepartmentUseCase = DepartmentUseCase;
//# sourceMappingURL=DepartmentUseCase.js.map