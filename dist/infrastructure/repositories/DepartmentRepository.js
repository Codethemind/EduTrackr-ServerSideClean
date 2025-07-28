"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const Department_1 = require("../../domain/entities/Department");
const DepartmentModel_1 = __importDefault(require("../models/DepartmentModel"));
function mapToDepartmentEntity(data) {
    return Department_1.Department.create({
        ...data,
        _id: data._id.toString(),
    });
}
class DepartmentRepository {
    async createDepartment(department) {
        const newDepartment = await DepartmentModel_1.default.create(department);
        return mapToDepartmentEntity(newDepartment.toObject());
    }
    async findDepartmentById(id) {
        const department = await DepartmentModel_1.default.findById(id);
        return department ? mapToDepartmentEntity(department.toObject()) : null;
    }
    async findDepartmentByCode(code) {
        const department = await DepartmentModel_1.default.findOne({ code });
        return department ? mapToDepartmentEntity(department.toObject()) : null;
    }
    async findDepartmentByEmail(email) {
        const department = await DepartmentModel_1.default.findOne({ departmentEmail: email });
        return department ? mapToDepartmentEntity(department.toObject()) : null;
    }
    async updateDepartment(id, department) {
        const updatedDepartment = await DepartmentModel_1.default.findByIdAndUpdate(id, { ...department, updatedAt: new Date() }, { new: true });
        return updatedDepartment ? mapToDepartmentEntity(updatedDepartment.toObject()) : null;
    }
    async deleteDepartment(id) {
        const result = await DepartmentModel_1.default.findByIdAndDelete(id);
        return !!result;
    }
    async getAllDepartments() {
        const departments = await DepartmentModel_1.default.find();
        return departments.map(department => mapToDepartmentEntity(department.toObject()));
    }
}
exports.DepartmentRepository = DepartmentRepository;
//# sourceMappingURL=DepartmentRepository.js.map