import ScheduleModel, { ISchedule } from '../models/ScheduleModel';

export class ScheduleRepository {
  async createSchedule(scheduleData: Partial<ISchedule>): Promise<ISchedule> {
    const schedule = new ScheduleModel(scheduleData);
    return await schedule.save();
  }

  async findScheduleById(id: string): Promise<ISchedule | null> {
    return await ScheduleModel.findById(id)
      .populate('departmentId')
      .populate('courseId')
      .populate('teacherId');
  }

  async updateSchedule(id: string, updateData: Partial<ISchedule>): Promise<ISchedule | null> {
    return await ScheduleModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
    .populate('departmentId')
    .populate('courseId')
    .populate('teacherId');
  }

  async deleteSchedule(id: string): Promise<boolean> {
    const result = await ScheduleModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllSchedules(): Promise<ISchedule[]> {
    return await ScheduleModel.find()
      .populate('departmentId')
      .populate('courseId')
      .populate('teacherId');
  }

  async getSchedulesByDepartment(departmentId: string): Promise<ISchedule[]> {
    return await ScheduleModel.find({ departmentId })
      .populate('departmentId')
      .populate('courseId')
      .populate('teacherId');
  }

  async getSchedulesByTeacher(teacherId: string): Promise<ISchedule[]> {
    return await ScheduleModel.find({ teacherId })
      .populate('departmentId')
      .populate('courseId')
      .populate('teacherId');
  }
} 