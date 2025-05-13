import { IStudentRepository } from "../../application/Interfaces/IStudent";
import Student from "../../domain/entities/Student";
import studentModel from "../models/StudentModel";
import { Types } from "mongoose"; // Important for ObjectId

function mapToStudentEntity(data: any): Student {
  // Map the nested populated courses if they exist
  const courses = Array.isArray(data.courses)
    ? data.courses.map((course: any) => {
        // Handle populated courseId reference
        if (course.courseId && typeof course.courseId === 'object') {
          return {
            courseId: course.courseId._id.toString(),
            name: course.courseId.name || course.name,
            code: course.courseId.code || course.code,
            department: course.courseId.departmentId?.name || course.department
          };
        }
        // Handle non-populated course data
        return {
          courseId: course.courseId?.toString() || course._id?.toString() || '',
          name: course.name || '',
          code: course.code || '',
          department: course.department || ''
        };
      })
    : [];

  // Extract department data, ensuring strings where needed
  const departmentId = data.department?._id?.toString() || 
                       (typeof data.department === 'string' ? data.department : '');
  const departmentName = data.department?.name || '';

  return new Student({
    _id: data._id as Types.ObjectId,
    username: data.username,
    firstname: data.firstname,
    lastname: data.lastname,
    email: data.email,
    password: data.password,
    isBlock: data.isBlock,
    profileImage: data.profileImage,
    // Department references - ensure these are strings
    departmentId: departmentId,
    departmentName: departmentName,
    class: data.class,
    // Use our processed courses
    courses: courses,
    role: data.role,
  });
}

export class StudentRepository implements IStudentRepository {

  async createStudent(student: Student): Promise<Student> {
    const newStudent = new studentModel(student);
    const savedStudent = await newStudent.save();
    const populatedStudent = await savedStudent.populate('department', 'name');
    return mapToStudentEntity(populatedStudent.toObject());
  }

  async findStudentById(id: string): Promise<Student | null> {
    const student = await studentModel.findById(id)
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      });
    return student ? mapToStudentEntity(student.toObject()) : null;
  }
  async findStudentByEmail(mail: string): Promise<Student | null> {
    const student = await studentModel.findOne({ email: mail })
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      });
    return student ? mapToStudentEntity(student.toObject()) : null;
  }

  async updateStudent(id: string, student: Partial<Student>): Promise<Student | null> {
    const updatedStudent = await studentModel.findByIdAndUpdate(id, student, { new: true })
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      });
    return updatedStudent ? mapToStudentEntity(updatedStudent.toObject()) : null;
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await studentModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllStudents(): Promise<Student[]> {
    const students = await studentModel.find()
      .populate('department', 'name code establishedDate headOfDepartment')
      .populate({
        path: 'courses.courseId',
        select: 'name code departmentId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      });
    return students.map(student => mapToStudentEntity(student.toObject()));
  }
}
