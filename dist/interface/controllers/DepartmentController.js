"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentController = void 0;
const mongoose_1 = require("mongoose");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
class DepartmentController {
    constructor(departmentUseCase) {
        this.departmentUseCase = departmentUseCase;
    }
    async createDepartment(req, res, next) {
        try {
            const department = await this.departmentUseCase.createDepartment(req.body);
            res.status(http_status_enum_1.HttpStatus.CREATED).json({
                success: true,
                message: "Department created successfully",
                data: department
            });
        }
        catch (error) {
            console.error("Create department error:", error);
            next(error);
        }
    }
    async getDepartmentById(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid department ID"
                });
                return;
            }
            const department = await this.departmentUseCase.getDepartmentById(id);
            if (!department) {
                res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Department not found"
                });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                data: department
            });
        }
        catch (error) {
            console.error("Get department error:", error);
            next(error);
        }
    }
    async updateDepartment(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid department ID"
                });
                return;
            }
            const department = await this.departmentUseCase.updateDepartment(id, req.body);
            if (!department) {
                res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Department not found"
                });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Department updated successfully",
                data: department
            });
        }
        catch (error) {
            console.error("Update department error:", error);
            next(error);
        }
    }
    async deleteDepartment(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid department ID"
                });
                return;
            }
            const deleted = await this.departmentUseCase.deleteDepartment(id);
            if (!deleted) {
                res.status(http_status_enum_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Department not found"
                });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Department deleted successfully"
            });
        }
        catch (error) {
            console.error("Delete department error:", error);
            next(error);
        }
    }
    async getAllDepartments(_req, res, next) {
        try {
            const departments = await this.departmentUseCase.getAllDepartments();
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                data: departments
            });
        }
        catch (error) {
            console.error("Get all departments error:", error);
            next(error);
        }
    }
}
exports.DepartmentController = DepartmentController;
//# sourceMappingURL=DepartmentController.js.map