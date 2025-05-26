export interface Assignment {
  id?: string;
  title: string;
  description: string;
  dueDate: Date;
  departmentId: string;
  teacherId: string;
  courseId: string;
  totalMarks: number;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  createdAt?: Date;
  updatedAt?: Date;
} 