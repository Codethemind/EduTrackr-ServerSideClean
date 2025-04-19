// core/domain/entities/Course.ts

export class Course {
    public readonly id?: string; // string representation of the MongoDB ObjectId
    public departmentId?: string | null;
    public code?: string | null;
    public description?: string | null;
    public title?: string | null;
    public credits?: number | null;
    public isActive?: boolean | null;
    public createdAt?: Date | null;
    public updatedAt?: Date | null;
  
    constructor(data: Partial<Course>) {
      Object.assign(this, data);
    }
  }
  