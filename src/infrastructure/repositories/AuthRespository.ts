import { Model, Document } from 'mongoose';
import { Types } from 'mongoose';
import Student from '../../domain/entities/Student';
import Admin from '../../domain/entities/Admin';
import Teacher from '../../domain/entities/Teacher';
import tokenModel   from '../models/PasswordResetTokenModel';
import { IAuthRepository } from '../../application/Interfaces/IAuthRepository';
import studentModel from '../models/StudentModel';
import adminModel from '../models/AdminModel';
import teacherModel from '../models/TeacherModel';

export class AuthRepository implements IAuthRepository {
  
  async findStudentByEmail(email: string): Promise<Student | null> {
    const studentDoc = await studentModel.findOne({ email }).lean(); // ✅ Use .lean() to get pure JSON
  
    if (!studentDoc) {
      return null;
    }
  
    return new Student({
      _id: studentDoc._id as Types.ObjectId, // ✅ tell TS it is ObjectId
      username: studentDoc.username,
      email: studentDoc.email,
      firstname: studentDoc.firstname,
      lastname: studentDoc.lastname,
      password: studentDoc.password,
      isBlock: studentDoc.isBlock,
      profileImage: studentDoc.profileImage,
      department: studentDoc.department,
      class: studentDoc.class,
      courses: studentDoc.courses,
      role: 'Student',
    });
  }
  async findAdminByEmail(email: string): Promise<Admin | null> {
    const student = await adminModel.findOne({email:email})
    if(!student){
      return null
    }
    return new Admin({
        username:student.username,
        email:student.email,
        firstname:student.firstname,
        lastname:student.lastname,
        password:student.password,
       
        profileImage:student.profileImage,
    })
}

async findTeacherByEmail(email: string): Promise<Teacher | null> {
  const teacherDoc = await teacherModel.findOne({ email }).lean(); // ✅ Use .lean() for plain JSON

  if (!teacherDoc) {
    return null;
  }

  return new Teacher({
    id: teacherDoc._id.toString(), // ✅ Teacher entity expects 'id' as string
    username: teacherDoc.username,
    email: teacherDoc.email,
    firstname: teacherDoc.firstname,
    lastname: teacherDoc.lastname,
    password: teacherDoc.password,
    profileImage: teacherDoc.profileImage,
    department: teacherDoc.department, // ✅ very important
    role: 'Teacher', // ✅ though in constructor it's auto-set, you can be explicit
  });
}


async updatePasswordByEmail(email: string, newPassword: string): Promise<boolean> {
  const student = await studentModel.findOneAndUpdate({ email }, { password: newPassword });
  if (student) return true;

  const teacher = await teacherModel.findOneAndUpdate({ email }, { password: newPassword });
  if (teacher) return true;

  const admin = await adminModel.findOneAndUpdate({ email }, { password: newPassword });
  if (admin) return true;

  return false;
}

async saveResetTokenByEmail(email: string, token: string, expiresAt: Date) {
  await tokenModel.findOneAndUpdate(
    { email },
    { token, expiresAt },
    { upsert: true }
  );
}

async validateResetToken(email: string, token: string) {
  const rec = await tokenModel.findOne({ email, token });
  return rec !== null && rec.expiresAt > new Date();
}

async clearResetToken(email: string) {
  await tokenModel.deleteOne({ email });
}


}

