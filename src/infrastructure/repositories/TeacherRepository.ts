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
    const populatedTeacher = await savedTeacher.populate('department', 'name code');
    return this.mapToEntity(populatedTeacher.toObject());
  }

  async findTeacherById(id: string): Promise<Teacher | null> {
    const teacher = await teacherModel.findById(id)
      .populate('department', 'name code')
      .lean();
    return teacher ? this.mapToEntity(teacher) : null;
  }

  async findTeacherByEmail(mail: string): Promise<Teacher | null> {
    const teacher = await teacherModel.findOne({ email: mail })
      .populate('department', 'name code')
      .lean();
    return teacher ? this.mapToEntity(teacher) : null;
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updatedTeacher = await teacherModel.findByIdAndUpdate(id, teacher, { new: true })
      .populate('department', 'name code')
      .lean();
    return updatedTeacher ? this.mapToEntity(updatedTeacher) : null;
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await teacherModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllTeachers(): Promise<Teacher[]> {
    const teachers = await teacherModel.find()
      .populate('department', 'name code')
      .lean();
    return teachers.map(this.mapToEntity);
  }

  // ---------------------------
  // 🧹 Private Mapping Function
  // ---------------------------
  private mapToEntity(doc: any): Teacher {
    // Extract department data safely
    const departmentId = doc.department?._id?.toString() || 
                       (typeof doc.department === 'string' ? doc.department : '');
    const departmentName = doc.department?.name || '';

    // Process profile image - ensure it's never undefined
    const defaultProfileImage = "https://res.cloudinary.com/djpom2k7h/image/upload/v1/student_profiles/default-profile.png";
    let profileImage = defaultProfileImage;

    if (doc.profileImage) {
      if (typeof doc.profileImage === 'string' && doc.profileImage.trim() !== '') {
        profileImage = doc.profileImage;
      }
    }

    return new Teacher({
      id: doc._id?.toString(),  // Convert MongoDB _id to string for your Entity
      username: doc.username,
      firstname: doc.firstname,
      lastname: doc.lastname,
      email: doc.email,
      password: doc.password,
      profileImage: profileImage,
      department: departmentId,
      departmentName: departmentName,
      role: 'Teacher',
    });
  }
}
