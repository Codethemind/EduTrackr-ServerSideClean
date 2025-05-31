import mongoose, { Schema } from 'mongoose';

const messageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to User (Student or Teacher)
  receiverId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }, // Reference to User (Student or Teacher)
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

export default mongoose.model('Message', messageSchema);