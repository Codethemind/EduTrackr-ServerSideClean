import MessageModel from '../models/MessageModel';
import { IMessage } from '../../application/Interfaces/IMessage';
import StudentModel from '../models/StudentModel';
import TeacherModel from '../models/TeacherModel';
import mongoose from 'mongoose';

export class MessageRepository {
  async saveMessage(message: IMessage): Promise<IMessage> {
    const newMessage = new MessageModel({
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      timestamp: message.timestamp,
      isRead: message.isRead,
    });
    const savedMessage = await newMessage.save();
    return savedMessage.toObject();
  }

  async getMessagesBetweenUsers(senderId: string, receiverId: string): Promise<IMessage[]> {
    const messages = await MessageModel.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .populate('senderId', 'firstname lastname role')
      .populate('receiverId', 'firstname lastname role')
      .sort({ timestamp: 1 })
      .lean();
    return messages;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    await MessageModel.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );
  }

  async getChatUsers(userId: string, role: 'Student' | 'Teacher'): Promise<any[]> {
    if (role === 'Student') {
      // Students can chat with teachers in their department
      const student = await StudentModel.findById(userId).select('department').lean();
      if (!student) throw new Error('Student not found');
      return await TeacherModel.find({ department: student.department })
        .select('firstname lastname _id role')
        .lean();
    } else {
      // Teachers can chat with students in their department
      const teacher = await TeacherModel.findById(userId).select('department').lean();
      if (!teacher) throw new Error('Teacher not found');
      return await StudentModel.find({ department: teacher.department })
        .select('firstname lastname _id role')
        .lean();
    }
  }
}