// IAssignment.ts
export interface IAssignmentSubmission {
  id?: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: Date;
  isLate?: boolean;
  submissionContent: {
    text?: string;
    files: string[];
  };
  grade?: number;
  feedback?: string;
  status?: 'SUBMITTED' | 'GRADED' | 'LATE';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssignment {
  id?: string;
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxMarks: number; // Changed from totalMarks to match repository
  courseId: string;
  departmentId: string;
  teacherId: string;
  departmentName?: string;
  teacherName?: string;
  courseName?: string;
  attachments?: string[];
  allowLateSubmission?: boolean;
  lateSubmissionPenalty?: number;
  submissionFormat?: string;
  isGroupAssignment?: boolean;
  maxGroupSize?: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'active'; // Added 'active' to match repository
  submissions: IAssignmentSubmission[];
  totalStudents?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssignmentFilters {
  courseId?: string;
  departmentId?: string;
  teacherId?: string;
  status?: string;
  sortBy?: string;
}