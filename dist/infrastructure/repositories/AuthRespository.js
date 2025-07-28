"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const mongoose_1 = require("mongoose");
const Student_1 = __importDefault(require("../../domain/entities/Student"));
const Admin_1 = __importDefault(require("../../domain/entities/Admin"));
const Teacher_1 = __importDefault(require("../../domain/entities/Teacher"));
const StudentModel_1 = __importDefault(require("../models/StudentModel"));
const AdminModel_1 = __importDefault(require("../models/AdminModel"));
const TeacherModel_1 = __importDefault(require("../models/TeacherModel"));
const PasswordResetTokenModel_1 = __importDefault(require("../models/PasswordResetTokenModel"));
const multer_1 = require("../../interface/middleware/multer");
class AuthRepository {
    toStudentEntity(doc) {
        let departmentId = "";
        let departmentName = "";
        if (doc.department && typeof doc.department === "object" && "_id" in doc.department) {
            departmentId = doc.department._id.toString();
            departmentName = doc.department.name || "";
        }
        else if (typeof doc.department === "string" || doc.department instanceof mongoose_1.Types.ObjectId) {
            departmentId = doc.department.toString();
        }
        const courses = Array.isArray(doc.courses)
            ? doc.courses.map((course) => ({
                courseId: course.courseId?.toString(),
                name: course.name,
                code: course.code,
                department: course.department,
            }))
            : [];
        return new Student_1.default({
            _id: doc._id,
            username: doc.username,
            email: doc.email,
            firstname: doc.firstname,
            lastname: doc.lastname,
            password: doc.password,
            isBlock: doc.isBlock,
            profileImage: doc.profileImage,
            departmentId,
            departmentName,
            class: doc.class,
            courses,
            role: "Student",
        });
    }
    toAdminEntity(doc) {
        return new Admin_1.default({
            id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            firstname: doc.firstname,
            lastname: doc.lastname,
            password: doc.password,
            profileImage: doc.profileImage,
            role: "Admin",
        });
    }
    toTeacherEntity(doc) {
        const departmentId = doc.department?._id?.toString() || (typeof doc.department === "string" ? doc.department : "");
        const departmentName = doc.department?.name || "";
        let profileImage = multer_1.DEFAULT_PROFILE_IMAGE;
        if (typeof doc.profileImage === "string" && doc.profileImage.trim() !== "") {
            profileImage = doc.profileImage.startsWith("http")
                ? doc.profileImage
                : (0, multer_1.ensureFullImageUrl)(doc.profileImage);
        }
        return new Teacher_1.default({
            id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            firstname: doc.firstname,
            lastname: doc.lastname,
            password: doc.password,
            profileImage,
            department: departmentId,
            departmentName,
            role: "Teacher",
        });
    }
    async findStudentByEmail(email) {
        const studentDoc = await StudentModel_1.default.findOne({ email }).populate("department", "name").lean();
        return studentDoc ? this.toStudentEntity(studentDoc) : null;
    }
    async findAdminByEmail(email) {
        const adminDoc = await AdminModel_1.default.findOne({ email }).lean();
        return adminDoc ? this.toAdminEntity(adminDoc) : null;
    }
    async findTeacherByEmail(email) {
        const teacherDoc = await TeacherModel_1.default.findOne({ email }).populate("department", "name code").lean();
        return teacherDoc ? this.toTeacherEntity(teacherDoc) : null;
    }
    async updatePasswordByEmail(email, newPassword) {
        const updated = (await StudentModel_1.default.findOneAndUpdate({ email }, { password: newPassword })) ||
            (await TeacherModel_1.default.findOneAndUpdate({ email }, { password: newPassword })) ||
            (await AdminModel_1.default.findOneAndUpdate({ email }, { password: newPassword }));
        return !!updated;
    }
    async saveResetTokenByEmail(email, token, expiresAt) {
        await PasswordResetTokenModel_1.default.findOneAndUpdate({ email }, { token, expiresAt }, { upsert: true });
    }
    async validateResetToken(email, token) {
        const record = await PasswordResetTokenModel_1.default.findOne({ email, token });
        return !!record && record.expiresAt > new Date();
    }
    async clearResetToken(email) {
        await PasswordResetTokenModel_1.default.deleteOne({ email });
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=AuthRespository.js.map