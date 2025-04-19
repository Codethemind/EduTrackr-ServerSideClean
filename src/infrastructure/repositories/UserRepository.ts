

// import Student from '../../domain/entities/Student';
// import Teacher from '../../domain/entities/Teacher';
// import Admin from '../../domain/entities/Admin';

// export class UserRepository {
//   async findAllStudents() {
//     return await Student.({}, '-password');
//   }

//   async findAllTeachers() {
//     return await Teacher.find({}, '-password');
//   }

//   async findAllAdmins() {
//     return await Admin.find({}, '-password');
//   }
// }
import { IUserRepository } from "../../application/Interfaces/IUser";

import studentModel from "../models/StudentModel";
import teacherModel from "../models/TeacherModel";
import admintModel from "../models/AdminModel";

export class UserRepositoryImpl implements IUserRepository {
  async getAllUsers(): Promise<any[]> {
    const students = await studentModel.find({}, { name: 1, email: 1, role: 'Student' });
    const teachers = await teacherModel.find({}, { name: 1, email: 1, role: 'Teacher' });
    const admins = await admintModel.find({}, { name: 1, email: 1, role: 'Admin' });

    return [
      ...students.map(s => ({ id: s._id, name: s.username, email: s.email, role: 'Student' })),
      ...teachers.map(t => ({ id: t._id, name: t.username, email: t.email, role: 'Teacher' })),
      ...admins.map(a => ({ id: a._id, name: a.username, email: a.email, role: 'Admin' })),
    ];
  }
}
