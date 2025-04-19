import { Request, Response } from 'express';
import admintModel from '../../infrastructure/models/AdminModel';
import teacherModel from '../../infrastructure/models/TeacherModel';
import studentModel from '../../infrastructure/models/StudentModel';


export const getTotalUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('get totaluses')
    const [adminCount, teacherCount, studentCount] = await Promise.all([
        admintModel.countDocuments(),
        teacherModel.countDocuments(),
        studentModel.countDocuments()
    ]);

    const totalUsers: number = adminCount + teacherCount + studentCount;

    res.status(200).json({
      success: true,
      data: {
        admins: adminCount,
        teachers: teacherCount,
        students: studentCount,
        total: totalUsers
      }
    });
  } catch (error) {
    console.error('Error fetching total users:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }
};
