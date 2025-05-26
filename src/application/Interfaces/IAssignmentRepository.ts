// IAssignmentRepository.ts
import { IAssignment, IAssignmentFilters, IAssignmentSubmission } from './IAssignment';

export interface IAssignmentRepository {
  create(assignment: Partial<IAssignment>): Promise<IAssignment>;
  findById(id: string): Promise<IAssignment | null>;
  findAll(filters?: IAssignmentFilters): Promise<IAssignment[]>; // Made filters optional
  findByDepartmentId(departmentId: string): Promise<IAssignment[]>;
  findByTeacherId(teacherId: string): Promise<IAssignment[]>;
  update(id: string, assignment: Partial<IAssignment>): Promise<IAssignment>;
  delete(id: string): Promise<void>;
  addSubmission(submission: IAssignmentSubmission): Promise<IAssignmentSubmission>; // Fixed signature
  updateSubmissionGrade(submissionId: string, grade: number, feedback?: string): Promise<IAssignmentSubmission>; // Fixed signature
  getSubmissions(assignmentId: string): Promise<IAssignmentSubmission[]>; // Fixed return type
}