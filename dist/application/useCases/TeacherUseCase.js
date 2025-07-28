"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherUseCase = void 0;
class TeacherUseCase {
    constructor(teacherRepository) {
        this.teacherRepository = teacherRepository;
    }
    async createTeacher(teacher) {
        return await this.teacherRepository.createTeacher(teacher);
    }
    async findTeacherById(id) {
        return await this.teacherRepository.findTeacherById(id);
    }
    async updateTeacher(id, teacherData) {
        return await this.teacherRepository.updateTeacher(id, teacherData);
    }
    async deleteTeacher(id) {
        return await this.teacherRepository.deleteTeacher(id);
    }
    async getAllTeachers() {
        return await this.teacherRepository.getAllTeachers();
    }
    async searchUsers(searchTerm, role = "Teacher") {
        try {
            return await this.teacherRepository.searchUsers(searchTerm, role);
        }
        catch (err) {
            console.error("Search Teachers Error:", err);
            throw new Error("Failed to search teachers");
        }
    }
}
exports.TeacherUseCase = TeacherUseCase;
//# sourceMappingURL=TeacherUseCase.js.map