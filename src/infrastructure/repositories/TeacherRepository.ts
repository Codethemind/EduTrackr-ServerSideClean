import { ITeacherRepository } from "../../application/Interfaces/ITeacher";
import Teacher from "../../domain/entities/Teacher";  // Assuming you have the Teacher entity type
import teacherModel from "../models/TeacherModel"; // Mongoose model

export class TeacherRepository implements ITeacherRepository {

  async createTeacher(teacher: Teacher): Promise<Teacher> {
    const newTeacher = new teacherModel(teacher);
    const savedTeacher = await newTeacher.save();
    return savedTeacher.toObject();  // Return the plain JavaScript object from the Mongoose document
  }

  async findTeacherById(id: string): Promise<Teacher | null> {
    const teacher = await teacherModel.findById(id).lean();  // Use .lean() to get plain JS object
    return teacher ? teacher : null;  // Return plain object directly
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updatedTeacher = await teacherModel.findByIdAndUpdate(id, teacher, { new: true }).lean();
    return updatedTeacher ? updatedTeacher : null;  // Return the updated plain object
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await teacherModel.findByIdAndDelete(id);
    return !!result;  // Return a boolean indicating success
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await teacherModel.find().lean();
    return teachers;  // Return an array of plain objects
  }
}
