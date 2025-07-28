"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentUseCase = void 0;
class StudentUseCase {
    constructor(studentRepository) {
        this.studentRepository = studentRepository;
    }
    async createStudent(student) {
        return await this.studentRepository.createStudent(student);
    }
    async getStudentById(id) {
        return await this.studentRepository.findStudentById(id);
    }
    async updateStudent(id, student) {
        return await this.studentRepository.updateStudent(id, student);
    }
    async deleteStudent(id) {
        return await this.studentRepository.deleteStudent(id);
    }
    async getAllStudents() {
        return await this.studentRepository.getAllStudents();
    }
    async searchUsers(searchTerm, role = "Student") {
        try {
            return await this.studentRepository.searchUsers(searchTerm, role);
        }
        catch (err) {
            console.error("Search Students Error:", err);
            throw new Error("Failed to search students");
        }
    }
}
exports.StudentUseCase = StudentUseCase;
//# sourceMappingURL=studentUseCase.js.map