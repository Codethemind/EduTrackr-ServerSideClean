"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRepository = exports.mapToStudentEntity = void 0;
const Student_1 = __importDefault(require("../../domain/entities/Student"));
const StudentModel_1 = __importDefault(require("../models/StudentModel"));
// Map function to convert MongoDB document to Student entity
const mapToStudentEntity = (data) => {
    const defaultProfileImage = 'https://res.cloudinary.com/demo/image/upload/v1700000000/student_profiles/default-student.jpg';
    const courses = Array.isArray(data.courses)
        ? data.courses.map((course) => {
            if (course.courseId && typeof course.courseId === 'object') {
                return {
                    courseId: course.courseId._id.toString(),
                    name: course.courseId.name || course.name,
                    code: course.courseId.code || course.code,
                    department: course.courseId.departmentId?.name || course.department,
                };
            }
            return {
                courseId: course.courseId?.toString() || course._id?.toString() || '',
                name: course.name || '',
                code: course.code || '',
                department: course.department || '',
            };
        })
        : [];
    const departmentId = data.department?._id?.toString() ||
        (typeof data.department === 'string' ? data.department : '');
    const departmentName = data.department?.name || '';
    return new Student_1.default({
        _id: data._id,
        username: data.username,
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        isBlock: data.isBlock,
        profileImage: data.profileImage && data.profileImage.trim() !== ''
            ? data.profileImage
            : defaultProfileImage,
        departmentId: departmentId,
        departmentName: departmentName,
        class: data.class,
        courses: courses,
        role: data.role,
    });
};
exports.mapToStudentEntity = mapToStudentEntity;
class StudentRepository {
    async createStudent(student) {
        const newStudent = new StudentModel_1.default(student);
        const savedStudent = await newStudent.save();
        const populatedStudent = await savedStudent.populate('department', 'name');
        return (0, exports.mapToStudentEntity)(populatedStudent.toObject());
    }
    async findStudentById(id) {
        const student = await StudentModel_1.default
            .findById(id)
            .populate('department', 'name code establishedDate headOfDepartment')
            .populate({
            path: 'courses.courseId',
            select: 'name code departmentId',
            populate: {
                path: 'departmentId',
                select: 'name',
            },
        });
        return student ? (0, exports.mapToStudentEntity)(student.toObject()) : null;
    }
    async findStudentByEmail(email) {
        const student = await StudentModel_1.default
            .findOne({ email })
            .populate('department', 'name code establishedDate headOfDepartment')
            .populate({
            path: 'courses.courseId',
            select: 'name code departmentId',
            populate: {
                path: 'departmentId',
                select: 'name',
            },
        });
        return student ? (0, exports.mapToStudentEntity)(student.toObject()) : null;
    }
    async updateStudent(id, student) {
        const updated = await StudentModel_1.default
            .findByIdAndUpdate(id, student, { new: true })
            .populate('department', 'name code establishedDate headOfDepartment')
            .populate({
            path: 'courses.courseId',
            select: 'name code departmentId',
            populate: {
                path: 'departmentId',
                select: 'name',
            },
        });
        return updated ? (0, exports.mapToStudentEntity)(updated.toObject()) : null;
    }
    async deleteStudent(id) {
        const result = await StudentModel_1.default.findByIdAndDelete(id);
        return !!result;
    }
    async getAllStudents() {
        const students = await StudentModel_1.default
            .find()
            .populate('department', 'name code establishedDate headOfDepartment')
            .populate({
            path: 'courses.courseId',
            select: 'name code departmentId',
            populate: {
                path: 'departmentId',
                select: 'name',
            },
        });
        return students.map((student) => (0, exports.mapToStudentEntity)(student.toObject()));
    }
    async searchUsers(searchTerm, role = 'Student') {
        const query = {
            $or: [
                { username: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
            ],
        };
        if (role !== 'All') {
            query.role = role;
        }
        const students = await StudentModel_1.default
            .find(query)
            .populate('department', 'name code establishedDate headOfDepartment')
            .populate({
            path: 'courses.courseId',
            select: 'name code departmentId',
            populate: {
                path: 'departmentId',
                select: 'name',
            },
        })
            .lean();
        return students.map((student) => (0, exports.mapToStudentEntity)(student));
    }
}
exports.StudentRepository = StudentRepository;
//# sourceMappingURL=studentRepository.js.map