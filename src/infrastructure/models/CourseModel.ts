import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ICoursesCollection extends Document {
  _id: ObjectId;
  DepartmentId: ObjectId | null;
  Code: String | null;
  Description: String | null;
  Title: String | null;
  Credits: Number | null;
  IsActive: Boolean | null;
  CreatedAt: Date | null;
  UpdatedAt: Date | null;
}

const CoursesCollectionSchema: Schema = new Schema({
  DepartmentId: { type: Schema.Types.ObjectId },
  Code: { type: String, unique: true },
  Description: { type: String },
  Title: { type: String },
  Credits: { type: Number },
  IsActive: { type: Boolean },
  CreatedAt: { type: Date },
  UpdatedAt: { type: Date },
});

const CoursesCollection = mongoose.model<ICoursesCollection>('CoursesCollection', CoursesCollectionSchema);

export default CoursesCollection;

