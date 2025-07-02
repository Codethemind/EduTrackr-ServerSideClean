import { Request, Response } from "express";
import { ScheduleUseCase } from "../../application/useCases/ScheduleUseCase";
import { isValidObjectId } from "mongoose";
import { HttpStatus } from '../../common/enums/http-status.enum';

export class ScheduleController {
  constructor(private scheduleUseCase: ScheduleUseCase) {}

  async createSchedule(req: Request, res: Response): Promise<void> {
    try {
      const { departmentId, courseId, teacherId, day, startTime, endTime, semester } = req.body;

      // Validate ObjectIds
      if (!isValidObjectId(departmentId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid department ID format"
        });
        return;
      }

      if (!isValidObjectId(courseId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid course ID format"
        });
        return;
      }

      if (!isValidObjectId(teacherId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid teacher ID format"
        });
        return;
      }

      // Validate required fields
      if (!day || !startTime || !endTime || !semester) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Missing required fields: day, startTime, endTime, or semester"
        });
        return;
      }

      const scheduleData = {
        departmentId,
        courseId,
        teacherId,
        day,
        startTime,
        endTime,
        semester
      };

      const schedule = await this.scheduleUseCase.createSchedule(scheduleData);
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: "Schedule created successfully",
        data: schedule
      });
    } catch (err: any) {
      console.error("Create Schedule Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to create schedule",
        error: err.message
      });
    }
  }

  async findScheduleById(req: Request, res: Response): Promise<void> {
    try {
      const schedule = await this.scheduleUseCase.findScheduleById(req.params.id);
      if (!schedule) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Schedule not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, data: schedule });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to retrieve schedule",
        error: err.message
      });
    }
  }

  async updateSchedule(req: Request, res: Response): Promise<void> {
    try {
      const scheduleId = req.params.id;
      
      if (!scheduleId || scheduleId === 'null') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid schedule ID"
        });
        return;
      }

      const updateData = { ...req.body };
      const updatedSchedule = await this.scheduleUseCase.updateSchedule(scheduleId, updateData);
      
      if (!updatedSchedule) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Schedule not found" });
        return;
      }
      
      res.status(HttpStatus.OK).json({ success: true, data: updatedSchedule });
    } catch (err: any) {
      console.error("Update Schedule Error:", err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to update schedule",
        error: err.message
      });
    }
  }

  async deleteSchedule(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await this.scheduleUseCase.deleteSchedule(req.params.id);
      if (!deleted) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Schedule not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, message: "Schedule deleted successfully" });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to delete schedule",
        error: err.message
      });
    }
  }

  async getAllSchedules(req: Request, res: Response): Promise<void> {
    try {
      const schedules = await this.scheduleUseCase.getAllSchedules();
      res.status(HttpStatus.OK).json({ success: true, data: schedules });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to retrieve schedules",
        error: err.message
      });
    }
  }

  async getSchedulesByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const schedules = await this.scheduleUseCase.getSchedulesByDepartment(req.params.departmentId);
      res.status(HttpStatus.OK).json({ success: true, data: schedules });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to retrieve department schedules",
        error: err.message
      });
    }
  }

  async getSchedulesByTeacher(req: Request, res: Response): Promise<void> {
    console.log(44,req.params.teacherId)
    try {
      const schedules = await this.scheduleUseCase.getSchedulesByTeacher(req.params.teacherId);
      res.status(HttpStatus.OK).json({ success: true, data: schedules });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to retrieve teacher schedules",
        error: err.message
      });
    }
  }

  async startLiveClass(req: Request, res: Response): Promise<void> {
    try {
      const scheduleId = req.params.id;
      if (!scheduleId || scheduleId === 'null') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid schedule ID"
        });
        return;
      }
      const updatedSchedule = await this.scheduleUseCase.startLiveClass(scheduleId);
      if (!updatedSchedule) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Schedule not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ success: true, message: "Live class started", data: updatedSchedule });
    } catch (err: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to start live class",
        error: err.message
      });
    }
  }
} 