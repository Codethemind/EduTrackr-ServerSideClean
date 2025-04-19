import { Document, ObjectId } from 'mongoose';

export interface IDepartmentsCollection extends Document {
    _id: ObjectId;
    Description: string | null;
    Code: string | null;
    UpdatedAt: Date | null;
    HeadId: ObjectId | null;
    CreatedAt: Date | null;
    Name: string | null;
} 