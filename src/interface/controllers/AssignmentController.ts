// AssignmentController.ts
import { Request, Response } from 'express';
import { AssignmentUseCase } from '../../application/useCases/AssignmentUseCase';
import { IAssignmentSubmission } from '../../application/Interfaces/IAssignment';

export class AssignmentController {
  constructor(private assignmentUseCase: AssignmentUseCase) {}

  async createAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignment = await this.assignmentUseCase.createAssignment(req.body);
      res.status(201).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create assignment'
      });
    }
  }

  async getAssignments(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        courseId: req.query.courseId as string,
        departmentId: req.query.departmentId as string,
        teacherId: req.query.teacherId as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string
      };
      
      // Remove undefined values
      Object.keys(filters).forEach(key => 
        filters[key as keyof typeof filters] === undefined && delete filters[key as keyof typeof filters]
      );
      
      const assignments = await this.assignmentUseCase.getAssignments(filters);
      res.status(200).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch assignments'
      });
    }
  }

  async getAssignmentsByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const departmentId = req.params.departmentId;
      const assignments = await this.assignmentUseCase.getAssignmentsByDepartment(departmentId);
      res.status(200).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch department assignments'
      });
    }
  }

  async getAssignmentsByTeacher(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = req.params.teacherId;
      const assignments = await this.assignmentUseCase.getAssignmentsByTeacher(teacherId);
      res.status(200).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch teacher assignments'
      });
    }
  }

  async getAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const assignment = await this.assignmentUseCase.getAssignmentById(req.params.id);
      if (!assignment) {
        res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch assignment'
      });
    }
  }

  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignment = await this.assignmentUseCase.updateAssignment(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update assignment'
      });
    }
  }

  async deleteAssignment(req: Request, res: Response): Promise<void> {
    try {
      await this.assignmentUseCase.deleteAssignment(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete assignment'
      });
    }
  }

  async submitAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { studentId, studentName, submissionContent } = req.body;

      console.log('Controller - Submission data:', {
        assignmentId: id,
        studentId,
        studentName,
        submissionContent
      });

      const submission: IAssignmentSubmission = {
        assignmentId: id,
        studentId,
        studentName,
        submissionContent,
        submittedAt: new Date()
      };

      const result = await this.assignmentUseCase.submitAssignment(id, submission);
      
      res.status(200).json({
        success: true,
        message: 'Assignment submitted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit assignment'
      });
    }
  }

  async gradeSubmission(req: Request, res: Response): Promise<void> {
    try {
      const { submissionId } = req.params; // Changed to submissionId
      const { grade, feedback } = req.body;
      
      const result = await this.assignmentUseCase.gradeSubmission(submissionId, grade, feedback);
      
      res.status(200).json({
        success: true,
        message: 'Grade submitted successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to grade submission'
      });
    }
  }

  async getSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const submissions = await this.assignmentUseCase.getSubmissions(req.params.id);
      res.status(200).json({
        success: true,
        data: submissions
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch submissions'  
      });
    }
  }

  async gradeMultipleSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { grades } = req.body;

      console.log('Controller - Batch grading data:', {
        assignmentId: id,
        grades
      });

      // Validate grades array
      if (!Array.isArray(grades) || grades.length === 0) {
        throw new Error('Grades must be a non-empty array');
      }

      // Validate each grade entry
      for (const gradeEntry of grades) {
        if (!gradeEntry.studentId || typeof gradeEntry.grade !== 'number') {
          throw new Error('Each grade entry must have a studentId and a numeric grade');
        }
        if (gradeEntry.grade < 0 || gradeEntry.grade > 100) {
          throw new Error('Grades must be between 0 and 100');
        }
      }

      console.log('Controller - Validated grades:', grades);

      const result = await this.assignmentUseCase.gradeMultipleSubmissions(id, grades);
      
      console.log('Controller - Grading result:', result);

      res.status(200).json({
        success: true,
        message: 'Grades submitted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in batch grading:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit grades'
      });
    }
  }
}