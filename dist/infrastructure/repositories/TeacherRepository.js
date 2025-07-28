"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherRepository = void 0;
const Teacher_1 = __importDefault(require("../../domain/entities/Teacher"));
const TeacherModel_1 = __importDefault(require("../models/TeacherModel"));
class TeacherRepository {
    async createTeacher(teacher) {
        const newTeacher = new TeacherModel_1.default({
            username: teacher.username,
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            email: teacher.email,
            password: teacher.password,
            profileImage: teacher.profileImage,
            department: teacher.department,
            role: teacher.role,
        });
        const savedTeacher = await newTeacher.save();
        const populatedTeacher = await savedTeacher.populate('department', 'name code');
        return this.mapToEntity(populatedTeacher.toObject());
    }
    async findTeacherById(id) {
        const teacher = await TeacherModel_1.default.findById(id)
            .populate('department', 'name code')
            .lean();
        return teacher ? this.mapToEntity(teacher) : null;
    }
    async findTeacherByEmail(mail) {
        const teacher = await TeacherModel_1.default.findOne({ email: mail })
            .populate('department', 'name code')
            .lean();
        return teacher ? this.mapToEntity(teacher) : null;
    }
    async updateTeacher(id, teacher) {
        const updatedTeacher = await TeacherModel_1.default.findByIdAndUpdate(id, teacher, { new: true })
            .populate('department', 'name code')
            .lean();
        return updatedTeacher ? this.mapToEntity(updatedTeacher) : null;
    }
    async deleteTeacher(id) {
        const result = await TeacherModel_1.default.findByIdAndDelete(id);
        return !!result;
    }
    async getAllTeachers() {
        const teachers = await TeacherModel_1.default.find()
            .populate('department', 'name code')
            .lean();
        return teachers.map(this.mapToEntity);
    }
    async searchUsers(searchTerm, role = 'Teacher') {
        const query = {
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
        };
        if (role !== 'All') {
            query.role = role;
        }
        const teachers = await TeacherModel_1.default.find(query).lean();
        return teachers.map((teacher) => this.toEntity(teacher));
    }
    toEntity(teacherObj) {
        return new Teacher_1.default({
            id: teacherObj._id?.toString(),
            username: teacherObj.username,
            email: teacherObj.email,
            firstname: teacherObj.firstname,
            lastname: teacherObj.lastname,
            password: teacherObj.password,
            profileImage: teacherObj.profileImage,
            role: teacherObj.role || 'Teacher',
            // ...add other fields as needed
        });
    }
    mapToEntity(doc) {
        const departmentId = doc.department?._id?.toString() ||
            (typeof doc.department === 'string' ? doc.department : '');
        const departmentName = doc.department?.name || '';
        const defaultProfileImage = "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";
        let profileImage = defaultProfileImage;
        if (doc.profileImage) {
            if (typeof doc.profileImage === 'string' && doc.profileImage.trim() !== '') {
                profileImage = doc.profileImage;
            }
        }
        return new Teacher_1.default({
            id: doc._id?.toString(),
            username: doc.username,
            firstname: doc.firstname,
            lastname: doc.lastname,
            email: doc.email,
            password: doc.password,
            profileImage: profileImage,
            department: departmentId,
            departmentName: departmentName,
            role: 'Teacher',
        });
    }
}
exports.TeacherRepository = TeacherRepository;
//# sourceMappingURL=TeacherRepository.js.map