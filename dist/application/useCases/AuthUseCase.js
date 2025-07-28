"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthUseCase = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const TokenService_1 = require("../../infrastructure/services/TokenService");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const createHttpError_1 = require("../../common/utils/createHttpError");
const http_message_enum_1 = require("../../common/enums/http-message.enum");
dotenv_1.default.config();
class AuthUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }
    async loginStudent(email, password) {
        if (!email) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.EMAIL_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const student = await this.authRepository.findStudentByEmail(email);
        if (!student) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.USER_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        }
        const isPasswordValid = student.password.startsWith('$2')
            ? await bcrypt_1.default.compare(password, student.password)
            : password === student.password;
        if (!isPasswordValid) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.PASSWORD_INCORRECT, http_status_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const payload = {
            id: student._id,
            email: student.email,
            role: student.role,
        };
        const accessToken = TokenService_1.TokenService.generateAccessToken(payload);
        const refreshToken = TokenService_1.TokenService.generateRefreshToken(payload);
        const safeStudent = {
            id: student._id,
            username: student.username,
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            isBlock: student.isBlock,
            profileImage: student.profileImage || null,
            departmentId: student.departmentId,
            departmentName: student.departmentName || '',
            class: student.class,
            courses: student.courses,
            role: student.role,
        };
        return {
            student: safeStudent,
            accessToken,
            refreshToken,
        };
    }
    async loginAdmin(email, password) {
        if (!email) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.EMAIL_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const admin = await this.authRepository.findAdminByEmail(email);
        if (!admin) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.USER_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        }
        const isPasswordValid = admin.password.startsWith('$2')
            ? await bcrypt_1.default.compare(password, admin.password)
            : password === admin.password;
        if (!isPasswordValid) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.PASSWORD_INCORRECT, http_status_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const payload = {
            id: admin.id,
            email: admin.email,
            role: admin.role,
        };
        const accessToken = TokenService_1.TokenService.generateAccessToken(payload);
        const refreshToken = TokenService_1.TokenService.generateRefreshToken(payload);
        const safeAdmin = {
            id: admin.id,
            username: admin.username,
            firstname: admin.firstname,
            lastname: admin.lastname,
            email: admin.email,
            profileImage: admin.profileImage,
            role: admin.role,
        };
        return {
            admin: safeAdmin,
            accessToken,
            refreshToken,
        };
    }
    async loginTeacher(email, password) {
        if (!email) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.EMAIL_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const teacher = await this.authRepository.findTeacherByEmail(email);
        if (!teacher) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.USER_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        }
        const isPasswordValid = teacher.password.startsWith('$2')
            ? await bcrypt_1.default.compare(password, teacher.password)
            : password === teacher.password;
        if (!isPasswordValid) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.PASSWORD_INCORRECT, http_status_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const payload = {
            id: teacher.id,
            email: teacher.email,
            role: teacher.role,
        };
        const accessToken = TokenService_1.TokenService.generateAccessToken(payload);
        const refreshToken = TokenService_1.TokenService.generateRefreshToken(payload);
        const safeTeacher = {
            id: teacher.id,
            username: teacher.username,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            email: teacher.email,
            departmentId: teacher.department,
            departmentName: teacher.departmentName || '',
            profileImage: teacher.profileImage,
            role: teacher.role,
        };
        return {
            teacher: safeTeacher,
            accessToken,
            refreshToken,
        };
    }
    async forgotPassword(email) {
        if (!email)
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.EMAIL_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        const user = await this.findUserAcrossAll(email);
        if (!user)
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.USER_NOT_FOUND, http_status_enum_1.HttpStatus.NOT_FOUND);
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.authRepository.saveResetTokenByEmail(email, token, expiresAt);
        const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Reset Link',
            html: `
        <p>Hello,</p>
        <p>You requested to reset your password. Click the link below to set a new one (valid for 1 hour):</p>
        <p><a href="${resetLink}">Reset your password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Thanks,<br/>Your App Team</p>
      `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Reset URL → http://localhost:5173/auth/reset-password/${token}`);
        return { success: true, token, message: http_message_enum_1.HttpMessage.RESET_SENT };
    }
    async resetPassword(email, token, newPassword) {
        if (!email || !token || !newPassword) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.PASSWORD_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const valid = await this.authRepository.validateResetToken(email, token);
        if (!valid)
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.INVALID_OR_EXPIRED_TOKEN, http_status_enum_1.HttpStatus.UNAUTHORIZED);
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        const updated = await this.authRepository.updatePasswordByEmail(email, hashed);
        if (!updated)
            (0, createHttpError_1.createHttpError)('Password reset failed', http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        await this.authRepository.clearResetToken(email);
        return { success: true, message: http_message_enum_1.HttpMessage.RESET_SUCCESS };
    }
    async findUserAcrossAll(email) {
        const student = await this.authRepository.findStudentByEmail(email);
        if (student)
            return student;
        const teacher = await this.authRepository.findTeacherByEmail(email);
        if (teacher)
            return teacher;
        const admin = await this.authRepository.findAdminByEmail(email);
        if (admin)
            return admin;
        return null;
    }
    async refreshAccessToken(refreshToken) {
        const payload = TokenService_1.TokenService.verifyRefreshToken(refreshToken);
        if (!payload) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.HttpMessage.INVALID_OR_EXPIRED_TOKEN, http_status_enum_1.HttpStatus.UNAUTHORIZED);
        }
        const newAccessToken = TokenService_1.TokenService.generateAccessToken({
            id: payload.id,
            email: payload.email,
            role: payload.role,
        });
        return { accessToken: newAccessToken };
    }
}
exports.AuthUseCase = AuthUseCase;
//# sourceMappingURL=AuthUseCase.js.map