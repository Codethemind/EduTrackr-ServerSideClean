"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const http_message_enum_1 = require("../../common/enums/http-message.enum");
const createHttpError_1 = require("../../common/utils/createHttpError");
class AuthController {
    constructor(authUseCase) {
        this.authUseCase = authUseCase;
    }
    async loginStudent(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next((0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.LOGIN_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const { student, accessToken, refreshToken } = await this.authUseCase.loginStudent(email, password);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.LOGIN_SUCCESS,
                data: {
                    student,
                    accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async loginAdmin(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next((0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.LOGIN_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const { admin, accessToken, refreshToken } = await this.authUseCase.loginAdmin(email, password);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.LOGIN_SUCCESS,
                data: {
                    admin,
                    accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async loginTeacher(req, res, next) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return next((0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.LOGIN_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const { teacher, accessToken, refreshToken } = await this.authUseCase.loginTeacher(email, password);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.LOGIN_SUCCESS,
                data: {
                    teacher,
                    accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return next((0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.EMAIL_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const response = await this.authUseCase.forgotPassword(email);
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.RESET_SENT,
                response,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const token = req.params.token;
            const { email, newPassword } = req.body;
            if (!email || !token || !newPassword) {
                return next((0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.PASSWORD_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const result = await this.authUseCase.resetPassword(email, token, newPassword);
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        console.log("Refreshing access token...");
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return next((0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.UNAUTHORIZED, http_status_enum_1.HttpStatus.UNAUTHORIZED));
            }
            const { accessToken } = await this.authUseCase.refreshAccessToken(refreshToken);
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: http_message_enum_1.HttpMessage.LOGIN_SUCCESS,
                data: {
                    accessToken,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map