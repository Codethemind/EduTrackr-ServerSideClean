// AssignmentUseCase.ts
import { IAssignment, IAssignmentFilters, IAssignmentSubmission } from '../Interfaces/IAssignment';
import { IAssignmentRepository } from '../Interfaces/IAssignmentRepository';

export class AssignmentUseCase {
  constructor(private assignmentRepository: IAssignmentRepository) {}

  async createAssignment(assignmentData: Partial<IAssignment>): Promise<IAssignment> {
    // Validate assignment data
    if (!assignmentData.title || !assignmentData.description || !assignmentData.dueDate) {
      throw new Error('Missing required fields');
    }

    // Set default values
    const assignment: Partial<IAssignment> = {
      ...assignmentData,
      status: assignmentData.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      submissions: [],
      maxGroupSize: assignmentData.isGroupAssignment ? assignmentData.maxGroupSize : 1,
      attachments: assignmentData.attachments || [] // Ensure attachments are included
    };

    console.log('UseCase - Creating assignment with data:', assignment);

    return this.assignmentRepository.create(assignment);
  }

  async getAssignments(filters?: IAssignmentFilters): Promise<IAssignment[]> {
    return this.assignmentRepository.findAll(filters);
  }

  async getAssignmentsByDepartment(departmentId: string): Promise<IAssignment[]> {
    return this.assignmentRepository.findByDepartmentId(departmentId);
  }

  async getAssignmentsByTeacher(teacherId: string): Promise<IAssignment[]> {
    return this.assignmentRepository.findByTeacherId(teacherId);
  }

  async getAssignmentById(id: string): Promise<IAssignment | null> {
    return this.assignmentRepository.findById(id);
  }

  async updateAssignment(id: string, assignmentData: Partial<IAssignment>): Promise<IAssignment> {
    // Validate update data
    if (assignmentData.dueDate && new Date(assignmentData.dueDate) < new Date()) {
      throw new Error('Due date cannot be in the past');
    }

    const updateData = {
      ...assignmentData,
      updatedAt: new Date()
    };

    return this.assignmentRepository.update(id, updateData);
  }

  async deleteAssignment(id: string): Promise<void> {
    return this.assignmentRepository.delete(id);
  }

  async submitAssignment(assignmentId: string, submission: IAssignmentSubmission): Promise<IAssignmentSubmission> {
    console.log('Submitting assignment with ID:', assignmentId);
    const assignment = await this.assignmentRepository.findById(assignmentId);
    console.log('Found assignment:', assignment ? 'Yes' : 'No');
    
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Check if submission is late
    const submittedAt = submission.submittedAt || new Date();
    const isLate = submittedAt > new Date(assignment.dueDate);
    if (isLate && !assignment.allowLateSubmission) {
      throw new Error('Late submissions are not allowed for this assignment');
    }

    // Validate submission data
    if (!submission.studentId || !submission.studentName) {
      throw new Error('Student ID and name are required');
    }

    if (!submission.submissionContent || 
        (!submission.submissionContent.text && 
         (!submission.submissionContent.files || submission.submissionContent.files.length === 0))) {
      throw new Error('Submission content is required');
    }

    const submissionData: IAssignmentSubmission = {
      ...submission,
      assignmentId,
      submittedAt,
      isLate
    };

    try {
      return await this.assignmentRepository.addSubmission(submissionData);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      throw error;
    }
  }

  async gradeSubmission(submissionId: string, grade: number, feedback?: string): Promise<IAssignmentSubmission> {
    // Get the submission first to validate it exists and get assignment details
    const assignment = await this.assignmentRepository.findById(submissionId.split('_')[0]); // Assuming submissionId format
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    if (grade > assignment.maxMarks) {
      throw new Error('Grade cannot exceed maximum marks');
    }

    return this.assignmentRepository.updateSubmissionGrade(submissionId, grade, feedback);
  }

  async getSubmissions(assignmentId: string): Promise<IAssignmentSubmission[]> {
    return this.assignmentRepository.getSubmissions(assignmentId);
  }

  async gradeMultipleSubmissions(assignmentId: string, grades: Array<{ studentId: string; grade: number }>): Promise<IAssignmentSubmission[]> {
    // Get the assignment first to validate it exists
    const assignment = await this.assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    // Create a map of studentId to submission for easier lookup
    const submissionMap = new Map(
      assignment.submissions.map(sub => [sub.studentId.toString(), sub])
    );

    // Validate that all studentIds exist in the submissions
    for (const gradeEntry of grades) {
      if (!submissionMap.has(gradeEntry.studentId)) {
        throw new Error(`No submission found for student ID: ${gradeEntry.studentId}`);
      }
    }

    // Update grades for each submission
    const updatedSubmissions: IAssignmentSubmission[] = [];
    for (const gradeEntry of grades) {
      const submission = submissionMap.get(gradeEntry.studentId);
      if (!submission) continue; // Skip if submission not found (shouldn't happen due to validation above)

      // Find the submission in the assignment's submissions array
      const assignment = await this.assignmentRepository.findById(assignmentId);
      if (!assignment) continue;

      const submissionToUpdate = assignment.submissions.find(
        sub => sub.studentId.toString() === gradeEntry.studentId
      );
      if (!submissionToUpdate) continue;

      const updatedSubmission = await this.assignmentRepository.updateSubmissionGrade(
        submissionToUpdate.id!.toString(),
        gradeEntry.grade
      );
      updatedSubmissions.push(updatedSubmission);
    }

    return updatedSubmissions;
  }
}