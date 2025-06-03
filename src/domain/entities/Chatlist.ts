import mongoose from 'mongoose';

export class Chatlist {
  public id!: string;
  public user!: mongoose.Types.ObjectId | string;
  public userModel!: 'Teacher' | 'Student';
  public teacherId!: mongoose.Types.ObjectId | string;
  public studentId!: mongoose.Types.ObjectId | string;
  public chats!: {
    chatId: string;
    contact: mongoose.Types.ObjectId | string;
    contactModel: 'Teacher' | 'Student';
    lastMessage: string;
    timestamp: Date;
  }[];

  constructor(data: Partial<Chatlist>) {
    Object.assign(this, data);
  }
}

export default Chatlist;