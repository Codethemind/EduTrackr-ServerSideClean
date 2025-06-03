import mongoose, { Schema } from 'mongoose';

export interface IMessage {
  _id: string;
  chatId: string;
  sender: mongoose.Types.ObjectId;
  senderModel: 'Teacher' | 'Student';
  receiver: mongoose.Types.ObjectId;
  receiverModel: 'Teacher' | 'Student';
  message?: string;
  mediaUrl?: string;
  replyTo?: mongoose.Types.ObjectId;
  reactions: { user: mongoose.Types.ObjectId; reaction: string }[];
  timestamp: Date;
  isDeleted?: boolean;
}

const MessageSchema = new Schema<IMessage>({
  chatId: { type: String, required: true },
  sender: { type: Schema.Types.ObjectId, required: true },
  senderModel: { type: String, enum: ['Teacher', 'Student'], required: true },
  receiver: { type: Schema.Types.ObjectId, required: true },
  receiverModel: { type: String, enum: ['Teacher', 'Student'], required: true },
  message: { type: String },
  mediaUrl: { type: String },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  reactions: [
    {
      user: { type: Schema.Types.ObjectId, required: true },
      reaction: { type: String, enum: ['❤️', '😂', '😢', '💯', '👍', '👎'], required: true },
    },
  ],
  timestamp: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

export interface IChatList {
  _id: string;
  user: mongoose.Types.ObjectId;
  userModel: 'Teacher' | 'Student';
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  chats: {
    chatId: string;
    contact: mongoose.Types.ObjectId;
    contactModel: 'Teacher' | 'Student';
    lastMessage: string;
    timestamp: Date;
  }[];
}

const ChatListSchema = new Schema<IChatList>({
  user: { type: Schema.Types.ObjectId, required: true },
  userModel: { type: String, enum: ['Teacher', 'Student'], required: true },
  teacherId: { type: Schema.Types.ObjectId, required: true },
  studentId: { type: Schema.Types.ObjectId, required: true },
  chats: [
    {
      chatId: { type: String, required: true },
      contact: { type: Schema.Types.ObjectId, required: true },
      contactModel: { type: String, enum: ['Teacher', 'Student'], required: true },
      lastMessage: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

// Ensure unique index on teacherId and studentId
ChatListSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const ChatList = mongoose.model<IChatList>('ChatList', ChatListSchema);