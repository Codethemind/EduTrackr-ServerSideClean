import { IStudentRepository } from "../../application/Interfaces/IStudent";
import Student from "../../domain/entities/Student";
import studentModel from "../models/StudentModel";

export class StudentRepository implements IStudentRepository {

  async createStudent(student: Student): Promise<Student> {
    const newStudent = new studentModel(student);
    const savedStudent = await newStudent.save();
    return savedStudent;  // Directly returning the saved document
  }

  async findStudentById(id: string): Promise<Student | null> {
    const student = await studentModel.findById(id).lean();
    return student ? student : null;  // No need for conversion, returning the raw document
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student | null> {
    const updatedStudent = await studentModel.findByIdAndUpdate(id, student, { new: true }).lean();
    return updatedStudent ? updatedStudent : null;  // Return the updated document
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await studentModel.findByIdAndDelete(id);
    return !!result;  // Check if the deletion was successful
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await studentModel.find().lean();
    return students;  // Return the list of students directly
  }
}
