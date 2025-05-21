import { ScheduleRepository } from '../../infrastructure/repositories/ScheduleRepository';
import { ISchedule } from '../../infrastructure/models/ScheduleModel';

export class ScheduleUseCase {
  constructor(private scheduleRepository: ScheduleRepository) {}

  async createSchedule(scheduleData: Partial<ISchedule>): Promise<ISchedule> {
    // Validate time format
    if (!this.isValidTimeFormat(scheduleData.startTime) || !this.isValidTimeFormat(scheduleData.endTime)) {
      throw new Error('Invalid time format');
    }

    // Check for time conflicts
    const conflicts = await this.checkTimeConflicts(scheduleData);
    if (conflicts) {
      throw new Error('Time slot conflicts with existing schedule');
    }

    return await this.scheduleRepository.createSchedule(scheduleData);
  }

  async findScheduleById(id: string): Promise<ISchedule | null> {
    return await this.scheduleRepository.findScheduleById(id);
  }

  async updateSchedule(id: string, updateData: Partial<ISchedule>): Promise<ISchedule | null> {
    // Validate time format if time is being updated
    if (updateData.startTime && !this.isValidTimeFormat(updateData.startTime)) {
      throw new Error('Invalid start time format');
    }
    if (updateData.endTime && !this.isValidTimeFormat(updateData.endTime)) {
      throw new Error('Invalid end time format');
    }

    // Check for time conflicts if time is being updated
    if (updateData.startTime || updateData.endTime) {
      const conflicts = await this.checkTimeConflicts(updateData, id);
      if (conflicts) {
        throw new Error('Time slot conflicts with existing schedule');
      }
    }

    return await this.scheduleRepository.updateSchedule(id, updateData);
  }

  async deleteSchedule(id: string): Promise<boolean> {
    return await this.scheduleRepository.deleteSchedule(id);
  }

  async getAllSchedules(): Promise<ISchedule[]> {
    return await this.scheduleRepository.getAllSchedules();
  }

  async getSchedulesByDepartment(departmentId: string): Promise<ISchedule[]> {
    return await this.scheduleRepository.getSchedulesByDepartment(departmentId);
  }

  async getSchedulesByTeacher(teacherId: string): Promise<ISchedule[]> {
    return await this.scheduleRepository.getSchedulesByTeacher(teacherId);
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private async checkTimeConflicts(scheduleData: Partial<ISchedule>, excludeId?: string): Promise<boolean> {
    const { day, startTime, endTime, teacherId, courseId } = scheduleData;
    
    if (!day || !startTime || !endTime || !teacherId || !courseId) {
      return false;
    }

    const existingSchedules = await this.scheduleRepository.getAllSchedules();
    
    return existingSchedules.some(schedule => {
      if (excludeId && schedule._id.toString() === excludeId) {
        return false;
      }

      if (schedule.day === day && schedule.teacherId.toString() === teacherId.toString()) {
        // Check if the new time slot overlaps with existing schedule
        return (
          (startTime >= schedule.startTime && startTime < schedule.endTime) ||
          (endTime > schedule.startTime && endTime <= schedule.endTime) ||
          (startTime <= schedule.startTime && endTime >= schedule.endTime)
        );
      }

      return false;
    });
  }
} 