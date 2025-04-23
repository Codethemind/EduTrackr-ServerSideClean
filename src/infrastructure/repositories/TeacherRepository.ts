import { ITeacherRepository } from "../../application/Interfaces/ITeacher";
import Teacher from "../../domain/entities/Teacher";  
import teacherModel from "../models/TeacherModel";  

export class TeacherRepository implements ITeacherRepository {

  async createTeacher(teacher: Teacher): Promise<Teacher> {
    const newTeacher = new teacherModel({
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
    return this.mapToEntity(savedTeacher.toObject());
  }

  async findTeacherById(id: string): Promise<Teacher | null> {
    const teacher = await teacherModel.findById(id).lean();
    return teacher ? this.mapToEntity(teacher) : null;
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updatedTeacher = await teacherModel.findByIdAndUpdate(id, teacher, { new: true }).lean();
    return updatedTeacher ? this.mapToEntity(updatedTeacher) : null;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await teacherModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await teacherModel.find().lean();
    return teachers.map(this.mapToEntity);
  }

  // ---------------------------
  // 🧹 Private Mapping Function
  // ---------------------------
  private mapToEntity(doc: any): Teacher {
    return new Teacher({
      id: doc._id?.toString(),  // Convert MongoDB _id to string for your Entity
      username: doc.username,
      firstname: doc.firstname,
      lastname: doc.lastname,
      email: doc.email,
      password: doc.password,
      profileImage: doc.profileImage,
      department: doc.department,
      role: 'Teacher',
    });
  }
}
