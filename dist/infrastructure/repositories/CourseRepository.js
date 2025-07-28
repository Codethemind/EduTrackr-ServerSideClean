"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRepository = void 0;
const Course_1 = require("../../domain/entities/Course");
const CourseModel_1 = __importDefault(require("../models/CourseModel"));
function mapToCourseEntity(data) {
    return Course_1.Course.create({
        ...data,
        _id: data._id.toString(),
        departmentId: data.departmentId?._id?.toString() || data.departmentId?.toString(),
        departmentName: data.departmentId?.name || undefined,
    });
}
class CourseRepository {
    async createCourse(course) {
        const newCourse = await CourseModel_1.default.create(course);
        return mapToCourseEntity(newCourse.toObject());
    }
    async findCourseById(id) {
        const course = await CourseModel_1.default.findById(id).populate('departmentId', 'name');
        return course ? mapToCourseEntity(course.toObject()) : null;
    }
    async findCourseByCode(code) {
        const course = await CourseModel_1.default.findOne({
            code: { $regex: new RegExp(`^${code}$`, 'i') }
        }).populate('departmentId', 'name');
        return course ? mapToCourseEntity(course.toObject()) : null;
    }
    async findCoursesByDepartment(departmentId) {
        const courses = await CourseModel_1.default.find({ departmentId }).populate('departmentId', 'name');
        return courses.map(course => mapToCourseEntity(course.toObject()));
    }
    async findCourseByName(name) {
        const course = await CourseModel_1.default.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        }).populate('departmentId', 'name');
        return course ? mapToCourseEntity(course.toObject()) : null;
    }
    async updateCourse(id, course) {
        const updatedCourse = await CourseModel_1.default.findByIdAndUpdate(id, { ...course, updatedAt: new Date() }, { new: true }).populate('departmentId', 'name');
        return updatedCourse ? mapToCourseEntity(updatedCourse.toObject()) : null;
    }
    async deleteCourse(id) {
        const result = await CourseModel_1.default.findByIdAndDelete(id);
        return !!result;
    }
    async getAllCourses() {
        const courses = await CourseModel_1.default.find().populate('departmentId', 'name');
        return courses.map(course => mapToCourseEntity(course.toObject()));
    }
}
exports.CourseRepository = CourseRepository;
//# sourceMappingURL=CourseRepository.js.map