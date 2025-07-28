"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherController = void 0;
const multer_1 = require("../middleware/multer");
const nodemailer_1 = __importDefault(require("nodemailer"));
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const createHttpError_1 = require("../../common/utils/createHttpError");
const mongoose_1 = require("mongoose");
class TeacherController {
    constructor(teacherUseCase) {
        this.teacherUseCase = teacherUseCase;
    }
    async createTeacherWithImage(req, res, next) {
        let emailError = null;
        try {
            const teacherData = {
                ...req.body,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                department: req.body.department,
                role: 'Teacher',
            };
            teacherData.profileImage = req.file
                ? (0, multer_1.ensureFullImageUrl)(req.file.path)
                : "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";
            const teacher = await this.teacherUseCase.createTeacher(teacherData);
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            const subject = `Welcome to Our Platform, ${teacher.firstname}!`;
            const html = `
        <h2>Welcome, ${teacher.firstname} ${teacher.lastname}!</h2>
        <p>Thank you for joining our platform as a ${teacher.role}.</p>
        <ul>
          <li>Name: ${teacher.firstname} ${teacher.lastname}</li>
          <li>Email: ${teacher.email}</li>
          <li>Role: ${teacher.role}</li>
          <li>Department: ${teacher.department}</li>
        </ul>
        <a href="http://localhost:5173/auth/teacher-login">Login to your Teacher Dashboard</a>
      `;
            try {
                await transporter.sendMail({
                    from: `"YourApp Team" <${process.env.EMAIL_USER}>`,
                    to: teacher.email,
                    subject,
                    html,
                });
            }
            catch (error) {
                emailError = error;
                console.warn(`Failed to send email to ${teacher.email}: ${error.message}`);
            }
            res.status(http_status_enum_1.HttpStatus.CREATED).json({
                success: true,
                message: emailError ? "Teacher created successfully, but email sending failed" : "Teacher created successfully",
                data: teacher,
            });
        }
        catch (error) {
            console.error("Create Teacher Error:", error);
            next(error);
        }
    }
    async updateProfileImage(req, res, next) {
        try {
            const teacherId = req.params.id;
            if (!req.file) {
                return next((0, createHttpError_1.createHttpError)("No image uploaded", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const profileImageUrl = (0, multer_1.ensureFullImageUrl)(req.file.path);
            const updatedTeacher = await this.teacherUseCase.updateTeacher(teacherId, {
                profileImage: profileImageUrl,
            });
            if (!updatedTeacher) {
                return next((0, createHttpError_1.createHttpError)("Teacher not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Profile image updated successfully",
                data: {
                    profileImage: profileImageUrl,
                    teacher: updatedTeacher,
                },
            });
        }
        catch (error) {
            console.error("Update Profile Image Error:", error);
            next(error);
        }
    }
    async findTeacherById(req, res, next) {
        try {
            const teacher = await this.teacherUseCase.findTeacherById(req.params.id);
            if (!teacher) {
                return next((0, createHttpError_1.createHttpError)("Teacher not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                data: teacher,
            });
        }
        catch (error) {
            console.error("Find Teacher Error:", error);
            next(error);
        }
    }
    async updateTeacher(req, res, next) {
        try {
            const teacherId = req.params.id;
            if (!teacherId || !(0, mongoose_1.isValidObjectId)(teacherId)) {
                return next((0, createHttpError_1.createHttpError)("Invalid teacher ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const updateData = { ...req.body };
            if (updateData.password && !updateData.password.startsWith('$2')) {
                const bcrypt = require('bcrypt');
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }
            if (updateData.firstName) {
                updateData.firstname = updateData.firstName;
                delete updateData.firstName;
            }
            if (updateData.lastName) {
                updateData.lastname = updateData.lastName;
                delete updateData.lastName;
            }
            if (updateData.profileImage) {
                updateData.profileImage = (0, multer_1.ensureFullImageUrl)(updateData.profileImage);
            }
            const updatedTeacher = await this.teacherUseCase.updateTeacher(teacherId, updateData);
            if (!updatedTeacher) {
                return next((0, createHttpError_1.createHttpError)("Teacher not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Teacher updated successfully",
                data: updatedTeacher,
            });
        }
        catch (error) {
            console.error("Update Teacher Error:", error);
            next(error);
        }
    }
    async deleteTeacher(req, res, next) {
        try {
            const deleted = await this.teacherUseCase.deleteTeacher(req.params.id);
            if (!deleted) {
                return next((0, createHttpError_1.createHttpError)("Teacher not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Teacher deleted successfully",
            });
        }
        catch (error) {
            console.error("Delete Teacher Error:", error);
            next(error);
        }
    }
    async getAllTeachers(_req, res, next) {
        try {
            const teachers = await this.teacherUseCase.getAllTeachers();
            console.log("Get All Teachers:", teachers);
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                data: teachers,
            });
        }
        catch (error) {
            console.error("Get All Teachers Error:", error);
            next(error);
        }
    }
}
exports.TeacherController = TeacherController;
//# sourceMappingURL=TeacherController.js.map