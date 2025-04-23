// src/domain/entities/Student.ts
import { Types } from 'mongoose'; // ✅ important

interface Course {
  id: number;
  name: string;
  code: string;
  department: string;
}

class Student {
  public readonly _id?: Types.ObjectId; // ✅ ObjectId, not string
  public username: string;
  public firstname: string;
  public lastname: string;
  public email: string;
  public password: string;
  public isBlock: boolean;
  public profileImage?: string;
  public department: string;
  public class: string;
  public courses: Course[];
  public role: 'Student';

  constructor(data: Partial<Student>) {
    this._id = data._id;
    this.username = data.username ?? '';
    this.firstname = data.firstname ?? '';
    this.lastname = data.lastname ?? '';
    this.email = data.email ?? '';
    this.password = data.password ?? '';
    this.isBlock = data.isBlock ?? false;
    this.profileImage = data.profileImage;
    this.department = data.department ?? '';
    this.class = data.class ?? '';
    this.courses = data.courses ?? [];
    this.role = 'Student';
  }
}

export default Student;
