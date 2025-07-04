// AssignmentController.ts
import { Request, Response } from 'express';
import { AssignmentUseCase } from '../../application/useCases/AssignmentUseCase';
import { AssignmentSubmission } from '../../domain/entities/Assignment';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import cloudinary from '../../infrastructure/services/cloudinary';
import { HttpStatus } from '../../common/enums/http-status.enum';

// Configure multer storage for assignments
const assignmentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'assignments',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  } as any
});

// Configure multer storage for submissions
const submissionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'submissions',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'jpg', 'jpeg', 'png'],
    resource_type: 'auto'
  } as any 
});

export const assignmentUpload = multer({ storage: assignmentStorage });
export const submissionUpload = multer({ storage: submissionStorage });

export class AssignmentController {
  constructor(private assignmentUseCase: AssignmentUseCase) {}

  async createAssignment(req: Request, res: Response): Promise<void> {
    console.log('hai assignmetn')
    try {
      // Handle file uploads
      const files = req.files as Express.Multer.File[];
      console.log('Uploaded files:', files);

      // Extract Cloudinary URLs from uploaded files
      const fileUrls = files ? files.map(file => file.path) : [];
      console.log('Cloudinary URLs:', fileUrls);

      // Prepare assignment data
      const assignmentData = {
        ...req.body,
        attachments: fileUrls, // Array of Cloudinary URLs
        courseId: req.body.courseId,
        departmentId: req.body.departmentId,
        teacherId: req.body.teacherId,
        maxMarks: Number(req.body.maxMarks),
        allowLateSubmission: req.body.allowLateSubmission === 'true',
        isGroupAssignment: req.body.isGroupAssignment === 'true',
        lateSubmissionPenalty: Number(req.body.lateSubmissionPenalty) || 0,
        maxGroupSize: Number(req.body.maxGroupSize) || 1,
        dueDate: new Date(req.body.dueDate)
      };

      console.log('Creating assignment with data:', assignmentData);

      // Create assignment in database with Cloudinary URLs
      const assignment = await this.assignmentUseCase.createAssignment(assignmentData);
      
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Assignment created successfully',
        data: assignment
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
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
      res.status(HttpStatus.OK).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch assignments'
      });
    }
  }

  async getAssignmentsByDepartment(req: Request, res: Response): Promise<void> {
    try {
      const departmentId = req.params.departmentId;
      const assignments = await this.assignmentUseCase.getAssignmentsByDepartment(departmentId);
      res.status(HttpStatus.OK).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch department assignments'
      });
    }
  }

  async getAssignmentsByTeacher(req: Request, res: Response): Promise<void> {
    try {
      const teacherId = req.params.teacherId;
      const assignments = await this.assignmentUseCase.getAssignmentsByTeacher(teacherId);
      res.status(HttpStatus.OK).json({
        success: true,
        data: assignments
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch teacher assignments'
      });
    }
  }

  async getAssignmentById(req: Request, res: Response): Promise<void> {
    try {
      const assignment = await this.assignmentUseCase.getAssignmentById(req.params.id);
      if (!assignment) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Assignment not found'
        });
        return;
      }
      res.status(HttpStatus.OK).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch assignment'
      });
    }
  }

  async updateAssignment(req: Request, res: Response): Promise<void> {
    try {
      const assignment = await this.assignmentUseCase.updateAssignment(req.params.id, req.body);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Assignment updated successfully',
        data: assignment
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update assignment'
      });
    }
  }

  async deleteAssignment(req: Request, res: Response): Promise<void> {
    console.log('how are ou')
    try {
      await this.assignmentUseCase.deleteAssignment(req.params.id);
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Assignment deleted successfully'
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete assignment'
      });
    }
  }

  async submitAssignment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { studentId, studentName, submissionContent } = req.body;

      // Handle file uploads
      const files = req.files as Express.Multer.File[];
      console.log('Uploaded submission files:', files);

      // Extract Cloudinary URLs from uploaded files
      const fileUrls = files ? files.map(file => file.path) : [];
      console.log('Submission Cloudinary URLs:', fileUrls);

      // Parse submissionContent if it's a string
      let parsedContent = submissionContent;
      if (typeof submissionContent === 'string') {
        try {
          parsedContent = JSON.parse(submissionContent);
        } catch (e) {
          parsedContent = { text: submissionContent, files: [] };
        }
      }

      const submission: AssignmentSubmission = {
        assignmentId: id,
        studentId,
        studentName,
        submissionContent: {
          text: parsedContent.text || '',
          files: [...(parsedContent.files || []), ...fileUrls] // Combine existing and new file URLs
        },
        submittedAt: new Date()
      };

      console.log('Submitting assignment with data:', submission);

      const result = await this.assignmentUseCase.submitAssignment(id, submission);
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Assignment submitted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error submitting assignment:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
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
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Grade submitted successfully',
        data: result
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to grade submission'
      });
    }
  }

  async getSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const submissions = await this.assignmentUseCase.getSubmissions(req.params.id);
      res.status(HttpStatus.OK).json({
        success: true,
        data: submissions
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
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

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Grades submitted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in batch grading:', error);
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to submit grades'
      });
    }
  }
}