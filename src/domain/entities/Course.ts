// core/domain/entities/Course.ts

export class Course {
    constructor(
        public name: string,
        public code: string,
        public departmentId: string,
        public departmentName?: string,
        public semester: number,
        public active: boolean = true,
        public createdAt: Date = new Date(),
        public updatedAt: Date = new Date(),
        public _id?: string
    ) {}

    static create(data: Partial<Course>): Course {
        return new Course(
            data.name || '',
            data.code || '',
            data.departmentId || '',
            data.departmentName,
            data.semester || 1,
            data.active,
            data.createdAt,
            data.updatedAt,
            data._id
        );
    }
}
  