// src/domain/entities/Student.ts

interface Course {
    id: number;
    name: string;
    code: string;
    department: string;
  }
  
  class Student {
    public readonly id?: string;
    public username: string;
    public firstname: string;
    public lastname: string;
    public email: string;
    public password: string;
    public isBlock: boolean;
    public profileImage?: string;
    public department: string;
    public class: string;
    public courses: Course[]; // 👉 Updated here
    public role: 'Student';
  
    constructor(data: Partial<Student>) {
      this.id = data.id;
      this.username = data.username ?? '';
      this.firstname = data.firstname ?? '';
      this.lastname = data.lastname ?? '';
      this.email = data.email ?? '';
      this.password = data.password ?? '';
      this.isBlock = data.isBlock ?? false;
      this.profileImage = data.profileImage;
      this.department = data.department ?? '';
      this.class = data.class ?? '';
      this.courses = data.courses ?? []; // 👉 Updated here
      this.role = 'Student';
    }
  }
  
  export default Student;
  