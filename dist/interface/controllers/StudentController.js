"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const multer_1 = require("../middleware/multer");
const mongoose_1 = require("mongoose");
const CourseModel_1 = __importDefault(require("../../infrastructure/models/CourseModel"));
const DepartmentModel_1 = __importDefault(require("../../infrastructure/models/DepartmentModel"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const http_status_enum_1 = require("../../common/enums/http-status.enum");
const createHttpError_1 = require("../../common/utils/createHttpError");
class StudentController {
    constructor(studentUseCase) {
        this.studentUseCase = studentUseCase;
    }
    async createStudentWithImage(req, res, next) {
        try {
            const studentData = {
                ...req.body,
                role: 'Student',
                firstname: req.body.firstname,
                lastname: req.body.lastname,
            };
            if (!(0, mongoose_1.isValidObjectId)(studentData.department)) {
                return next((0, createHttpError_1.createHttpError)("Invalid department ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const department = await DepartmentModel_1.default.findById(studentData.department);
            if (!department) {
                return next((0, createHttpError_1.createHttpError)("Department not found", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            let courseIds = [];
            if (typeof studentData.courses === 'string') {
                try {
                    courseIds = JSON.parse(studentData.courses);
                }
                catch {
                    return next((0, createHttpError_1.createHttpError)("Courses must be a valid JSON array", http_status_enum_1.HttpStatus.BAD_REQUEST));
                }
            }
            if (courseIds.length > 0) {
                const courses = await CourseModel_1.default.find({ _id: { $in: courseIds } }).populate('departmentId', 'name');
                if (courses.length !== courseIds.length) {
                    return next((0, createHttpError_1.createHttpError)("Some course IDs are invalid", http_status_enum_1.HttpStatus.BAD_REQUEST));
                }
                studentData.courses = courses.map(course => ({
                    courseId: course._id,
                    name: course.name,
                    code: course.code,
                    department: course.departmentId.name
                }));
            }
            else {
                studentData.courses = [];
            }
            studentData.profileImage = req.file
                ? (0, multer_1.ensureFullImageUrl)(req.file.path)
                : "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";
            const student = await this.studentUseCase.createStudent(studentData);
            const transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });
            const subject = `Welcome to Our Platform, ${student.firstname}!`;
            const html = `
        <h2>Welcome, ${student.firstname} ${student.lastname}!</h2>
        <p>Thank you for joining as a ${student.role}.</p>
        <ul>
          <li>Email: ${student.email}</li>
          <li>Department: ${department.name}</li>
          <li>Class: ${student.class}</li>
        </ul>
        <p><a href="http://localhost:5173/auth/student-login">Login Here</a></p>
      `;
            try {
                await transporter.sendMail({
                    from: `"EduApp" <${process.env.EMAIL_USER}>`,
                    to: student.email,
                    subject,
                    html,
                });
            }
            catch (emailError) {
                console.warn("Email failed:", emailError.message);
            }
            res.status(http_status_enum_1.HttpStatus.CREATED).json({
                success: true,
                message: "Student created successfully",
                data: this.formatStudentForResponse(student),
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateProfileImage(req, res, next) {
        try {
            const studentId = req.params.id;
            if (!req.file) {
                return next((0, createHttpError_1.createHttpError)("No image uploaded", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const imageUrl = (0, multer_1.ensureFullImageUrl)(req.file.path);
            const updated = await this.studentUseCase.updateStudent(studentId, { profileImage: imageUrl });
            if (!updated) {
                return next((0, createHttpError_1.createHttpError)("Student not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Profile image updated",
                data: { profileImage: updated.profileImage, student: updated }
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getStudentById(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return next((0, createHttpError_1.createHttpError)("Invalid student ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const student = await this.studentUseCase.getStudentById(id);
            if (!student) {
                return next((0, createHttpError_1.createHttpError)("Student not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                data: this.formatStudentForResponse(student)
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateStudent(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return next((0, createHttpError_1.createHttpError)("Invalid student ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
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
            if (updateData.department && (0, mongoose_1.isValidObjectId)(updateData.department)) {
                const department = await DepartmentModel_1.default.findById(updateData.department);
                if (!department) {
                    return next((0, createHttpError_1.createHttpError)("Department not found", http_status_enum_1.HttpStatus.BAD_REQUEST));
                }
            }
            let courseIds = [];
            if (typeof updateData.courses === 'string') {
                courseIds = JSON.parse(updateData.courses);
            }
            else if (Array.isArray(updateData.courses)) {
                courseIds = updateData.courses.map((c) => c?.courseId || c?._id || c).filter(Boolean);
            }
            if (courseIds.length > 0) {
                const courses = await CourseModel_1.default.find({ _id: { $in: courseIds } }).populate('departmentId', 'name');
                if (courses.length !== courseIds.length) {
                    return next((0, createHttpError_1.createHttpError)("One or more courses are invalid", http_status_enum_1.HttpStatus.BAD_REQUEST));
                }
                updateData.courses = courses.map(course => ({
                    courseId: course._id,
                    name: course.name,
                    code: course.code,
                    department: course.departmentId.name,
                }));
            }
            const student = await this.studentUseCase.updateStudent(id, updateData);
            if (!student) {
                return next((0, createHttpError_1.createHttpError)("Student not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                message: "Student updated",
                data: this.formatStudentForResponse(student)
            });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteStudent(req, res, next) {
        try {
            const { id } = req.params;
            if (!(0, mongoose_1.isValidObjectId)(id)) {
                return next((0, createHttpError_1.createHttpError)("Invalid student ID", http_status_enum_1.HttpStatus.BAD_REQUEST));
            }
            const deleted = await this.studentUseCase.deleteStudent(id);
            if (!deleted) {
                return next((0, createHttpError_1.createHttpError)("Student not found", http_status_enum_1.HttpStatus.NOT_FOUND));
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({ success: true, message: "Student deleted" });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllStudents(_req, res, next) {
        try {
            const students = await this.studentUseCase.getAllStudents();
            console.log("Retrieved Students:", students);
            res.status(http_status_enum_1.HttpStatus.OK).json({
                success: true,
                data: students.map(this.formatStudentForResponse),
            });
        }
        catch (error) {
            next(error);
        }
    }
    formatStudentForResponse(student) {
        const formatted = { ...student };
        if (formatted.courses?.length) {
            formatted.courses = formatted.courses.map((course) => ({
                ...course,
                id: course.courseId || course._id || course.id,
                courseId: course.courseId || course._id || course.id,
                name: course.name,
                code: course.code,
                department: course.department,
            }));
        }
        if (typeof formatted.department === 'object') {
            formatted.departmentId = formatted.department._id;
            formatted.departmentName = formatted.department.name;
            formatted.department = formatted.department._id;
        }
        return formatted;
    }
}
exports.StudentController = StudentController;
//# sourceMappingURL=StudentController.js.map