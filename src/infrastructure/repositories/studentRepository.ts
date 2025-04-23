import { IStudentRepository } from "../../application/Interfaces/IStudent";
import Student from "../../domain/entities/Student";
import studentModel from "../models/StudentModel";
import { Types } from "mongoose"; // Important for ObjectId

function mapToStudentEntity(data: any): Student {
  return new Student({
    ...data,
    _id: data._id as Types.ObjectId, // ✅ Force _id to correct type
  });
}

export class StudentRepository implements IStudentRepository {

  async createStudent(student: Student): Promise<Student> {
    const newStudent = new studentModel(student);
    const savedStudent = await newStudent.save();
    return mapToStudentEntity(savedStudent.toObject()); // ✅
  }

  async findStudentById(id: string): Promise<Student | null> {
    const student = await studentModel.findById(id);
    return student ? mapToStudentEntity(student.toObject()) : null; // ✅
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student | null> {
    const updatedStudent = await studentModel.findByIdAndUpdate(id, student, { new: true });
    return updatedStudent ? mapToStudentEntity(updatedStudent.toObject()) : null; // ✅
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await studentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await studentModel.find();
    return students.map(student => mapToStudentEntity(student.toObject())); // ✅
  }
}
