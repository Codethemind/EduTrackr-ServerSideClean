"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const http_message_enum_1 = require("../../common/enums/http-message.enum");
class AdminController {
    constructor(adminUseCase) {
        this.adminUseCase = adminUseCase;
    }
    async createAdminWithImage(req, res, next) {
        try {
            const adminData = req.body;
            const profileImagePath = req.file?.path;
            const admin = await this.adminUseCase.createAdmin(adminData, profileImagePath);
            res.status(http_status_enum_1.HttpStatus.CREATED).json({
                success: true,
                message: http_message_enum_1.HttpMessage.ADMIN_CREATED,
                data: admin,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateAdminProfileImage(req, res, next) {
        try {
            const adminId = req.params.id;
            const profileImagePath = req.file?.path;
            if (!profileImagePath) {
                return next({
                    status: http_status_enum_1.HttpStatus.BAD_REQUEST,
                    message: http_message_enum_1.HttpMessage.NO_IMAGE_UPLOADED,
                });
            }
            const updatedAdmin = await this.adminUseCase.updateAdminProfileImage(adminId, profileImagePath);
            if (!updatedAdmin) {
                return next({
                    status: http_status_enum_1.HttpStatus.NOT_FOUND,
                    message: http_message_enum_1.HttpMessage.ADMIN_NOT_FOUND,
                });
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.PROFILE_IMAGE_UPDATED,
                data: {
                    profileImage: updatedAdmin.profileImage,
                    admin: updatedAdmin,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async findAdminById(req, res, next) {
        try {
            const admin = await this.adminUseCase.findAdminById(req.params.id);
            if (!admin) {
                return next({
                    status: http_status_enum_1.HttpStatus.NOT_FOUND,
                    message: http_message_enum_1.HttpMessage.ADMIN_NOT_FOUND,
                });
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.ADMIN_RETRIEVED,
                data: admin,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateAdmin(req, res, next) {
        try {
            const adminId = req.params.id;
            const adminData = req.body;
            const profileImagePath = req.file?.path;
            const updatedAdmin = await this.adminUseCase.updateAdmin(adminId, adminData, profileImagePath);
            if (!updatedAdmin) {
                return next({
                    status: http_status_enum_1.HttpStatus.NOT_FOUND,
                    message: http_message_enum_1.HttpMessage.ADMIN_NOT_FOUND,
                });
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.ADMIN_RETRIEVED,
                data: updatedAdmin,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteAdmin(req, res, next) {
        try {
            const deleted = await this.adminUseCase.deleteAdmin(req.params.id);
            if (!deleted) {
                return next({
                    status: http_status_enum_1.HttpStatus.NOT_FOUND,
                    message: http_message_enum_1.HttpMessage.ADMIN_NOT_FOUND,
                });
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.ADMIN_DELETED,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllAdmins(req, res, next) {
        try {
            const admins = await this.adminUseCase.getAllAdmins();
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.ADMINS_RETRIEVED,
                data: admins,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async searchUsers(req, res, next) {
        try {
            const { searchTerm = "", role } = req.query;
            if (typeof searchTerm !== "string") {
                return next({
                    status: http_status_enum_1.HttpStatus.BAD_REQUEST,
                    message: http_message_enum_1.HttpMessage.INVALID_SEARCH_TERM,
                });
            }
            if (role && typeof role !== "string") {
                return next({
                    status: http_status_enum_1.HttpStatus.BAD_REQUEST,
                    message: http_message_enum_1.HttpMessage.INVALID_ROLE_PARAM,
                });
            }
            const users = await this.adminUseCase.searchUsers(searchTerm, role);
            console.log("Search Users Result:", users);
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                data: users,
                message: users.length ? http_message_enum_1.HttpMessage.USERS_RETRIEVED : http_message_enum_1.HttpMessage.NO_USERS_FOUND,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=AdminController.js.map