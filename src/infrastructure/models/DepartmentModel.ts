import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IDepartmentsCollection extends Document {
  _id: ObjectId;
  Code: String | null;
  Description: String | null;
  HeadId: ObjectId | null;
  CreatedAt: Date | null;
  UpdatedAt: Date | null;
  Name: String | null;
}

const DepartmentsCollectionSchema: Schema = new Schema({
  Code: { type: String, unique: true },
  Description: { type: String },
  HeadId: { type: Schema.Types.ObjectId },
  CreatedAt: { type: Date },
  UpdatedAt: { type: Date },
  Name: { type: String },
});

const DepartmentsCollection = mongoose.model<IDepartmentsCollection>('DepartmentsCollection', DepartmentsCollectionSchema);

export default DepartmentsCollection;

