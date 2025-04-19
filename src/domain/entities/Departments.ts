// core/domain/entities/Department.ts

export class Department {
    public readonly id?: string; // string representation of ObjectId
    public code?: string | null;
    public description?: string | null;
    public headId?: string | null; // reference to another entity (User) by id
    public createdAt?: Date | null;
    public updatedAt?: Date | null;
    public name?: string | null;
  
    constructor(data: Partial<Department>) {
      Object.assign(this, data);
    }
  }
  