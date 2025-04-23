import { IStudentRepository } from "../Interfaces/IStudent";
import Student from "../../domain/entities/Student";

export class StudentUseCase {
  constructor(private studentRepository: IStudentRepository) {}

  async createStudent(student: Student): Promise<Student> {
    return await this.studentRepository.createStudent(student);
  }

  async getStudentById(id: string): Promise<Student | null> {
    return await this.studentRepository.findStudentById(id);
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student | null> {
    return await this.studentRepository.updateStudent(id, student);
  }

  async deleteStudent(id: string): Promise<boolean> {
    return await this.studentRepository.deleteStudent(id);
  }

  async getAllStudents(): Promise<Student[]> {
    return await this.studentRepository.getAllStudents();
  }
}
