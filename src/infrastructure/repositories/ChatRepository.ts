import mongoose from 'mongoose';
import { IChatRepository } from '../../application/Interfaces/IChatRepository';
import { IChatList, IMessage, Message, ChatList } from '../../infrastructure/models/chat.models';
import Chatlist from '../../domain/entities/Chatlist';
import MessageEntity from '../../domain/entities/Message';

export class ChatRepository implements IChatRepository {
  async initiateChat(teacherId: string, studentId: string): Promise<string> {
    const chatId = new mongoose.Types.ObjectId().toString();
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);
    const studentObjectId = new mongoose.Types.ObjectId(studentId);

    // Update or create chat list for teacher
    await this.updateChatList({
      user: teacherObjectId,
      userModel: 'Teacher',
      contact: studentObjectId,
      contactModel: 'Student',
      chatId,
      lastMessage: '',
      timestamp: new Date(),
      teacherId: teacherObjectId,
      studentId: studentObjectId,
    });

    // Update or create chat list for student
    await this.updateChatList({
      user: studentObjectId,
      userModel: 'Student',
      contact: teacherObjectId,
      contactModel: 'Teacher',
      chatId,
      lastMessage: '',
      timestamp: new Date(),
      teacherId: teacherObjectId,
      studentId: studentObjectId,
    });

    return chatId;
  }

  async saveMessage(message: Partial<MessageEntity>): Promise<MessageEntity> {
    const senderObjectId = message.sender
      ? new mongoose.Types.ObjectId(message.sender.toString())
      : undefined;
    const receiverObjectId = message.receiver
      ? new mongoose.Types.ObjectId(message.receiver.toString())
      : undefined;
    const replyToObjectId = message.replyTo
      ? new mongoose.Types.ObjectId(message.replyTo.toString())
      : undefined;

    if (!senderObjectId || !receiverObjectId) {
      throw new Error('Sender and receiver IDs are required');
    }

    const savedMessage = await Message.create({
      chatId: message.chatId,
      sender: senderObjectId,
      senderModel: message.senderModel,
      receiver: receiverObjectId,
      receiverModel: message.receiverModel,
      message: message.message || undefined,
      mediaUrl: message.mediaUrl || undefined,
      replyTo: replyToObjectId,
      timestamp: message.timestamp || new Date(),
      isDeleted: false,
    });

    await this.updateChatList({
      user: senderObjectId,
      userModel: message.senderModel as 'Teacher' | 'Student',
      contact: receiverObjectId,
      contactModel: message.receiverModel as 'Teacher' | 'Student',
      chatId: message.chatId!,
      lastMessage: message.message || message.mediaUrl || 'Media sent',
      timestamp: savedMessage.timestamp,
      teacherId: message.senderModel === 'Teacher' ? senderObjectId : receiverObjectId,
      studentId: message.senderModel === 'Student' ? senderObjectId : receiverObjectId,
    });

    await this.updateChatList({
      user: receiverObjectId,
      userModel: message.receiverModel as 'Teacher' | 'Student',
      contact: senderObjectId,
      contactModel: message.senderModel as 'Teacher' | 'Student',
      chatId: message.chatId!,
      lastMessage: message.message || message.mediaUrl || 'Media sent',
      timestamp: savedMessage.timestamp,
      teacherId: message.senderModel === 'Teacher' ? senderObjectId : receiverObjectId,
      studentId: message.senderModel === 'Student' ? senderObjectId : receiverObjectId,
    });

    return new MessageEntity({
      id: savedMessage._id.toString(),
      chatId: savedMessage.chatId,
      sender: savedMessage.sender,
      senderModel: savedMessage.senderModel,
      receiver: savedMessage.receiver,
      receiverModel: savedMessage.receiverModel,
      message: savedMessage.message,
      mediaUrl: savedMessage.mediaUrl,
      replyTo: savedMessage.replyTo,
      reactions: savedMessage.reactions,
      timestamp: savedMessage.timestamp,
      isDeleted: savedMessage.isDeleted,
    });
  }

  async getMessages(chatId: string): Promise<MessageEntity[]> {
    const messages = await Message.find({ chatId, isDeleted: false })
      .populate('replyTo')
      .sort({ timestamp: 1 });
    return messages.map(
      (msg) =>
        new MessageEntity({
          id: msg._id.toString(),
          chatId: msg.chatId,
          sender: msg.sender,
          senderModel: msg.senderModel,
          receiver: msg.receiver,
          receiverModel: msg.receiverModel,
          message: msg.message,
          mediaUrl: msg.mediaUrl,
          replyTo: msg.replyTo,
          reactions: msg.reactions,
          timestamp: msg.timestamp,
          isDeleted: msg.isDeleted,
        })
    );
  }

  async getChatList(userId: string): Promise<Chatlist | null> {
    const chatlist = await ChatList.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$chats' },
      {
        $lookup: {
          from: 'teachers',
          localField: 'chats.contact',
          foreignField: '_id',
          as: 'teacherDetails',
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: 'chats.contact',
          foreignField: '_id',
          as: 'studentDetails',
        },
      },
      {
        $addFields: {
          'chats.contact': {
            $cond: {
              if: { $eq: ['$chats.contactModel', 'Teacher'] },
              then: { $arrayElemAt: ['$teacherDetails', 0] },
              else: { $arrayElemAt: ['$studentDetails', 0] },
            },
          },
          'chats.chatId': '$chats.chatId',
        },
      },
      {
        $project: {
          teacherDetails: 0,
          studentDetails: 0,
          'chats.contact.password': 0,
        },
      },
      {
        $group: {
          _id: '$_id',
          user: { $first: '$user' },
          userModel: { $first: '$userModel' },
          teacherId: { $first: '$teacherId' },
          studentId: { $first: '$studentId' },
          chats: { $push: '$chats' },
        },
      },
    ]);

    return chatlist.length > 0
      ? new Chatlist({
          id: chatlist[0]._id.toString(),
          user: chatlist[0].user,
          userModel: chatlist[0].userModel,
          teacherId: chatlist[0].teacherId,
          studentId: chatlist[0].studentId,
          chats: chatlist[0].chats,
        })
      : null;
  }

  async updateChatList(message: {
    user: mongoose.Types.ObjectId;
    userModel: 'Teacher' | 'Student';
    contact: mongoose.Types.ObjectId;
    contactModel: 'Teacher' | 'Student';
    chatId: string;
    lastMessage: string;
    timestamp: Date;
    teacherId?: mongoose.Types.ObjectId;
    studentId?: mongoose.Types.ObjectId;
  }): Promise<void> {
    const chatlist = await ChatList.findOne({
      user: message.user,
      userModel: message.userModel,
    });

    if (chatlist) {
      const existingChatIndex = chatlist.chats.findIndex(
        (chat) =>
          chat.contact.toString() === message.contact.toString() &&
          chat.contactModel === message.contactModel &&
          chat.chatId === message.chatId
      );

      if (existingChatIndex !== -1) {
        chatlist.chats[existingChatIndex].lastMessage = message.lastMessage;
        chatlist.chats[existingChatIndex].timestamp = message.timestamp;
      } else {
        chatlist.chats.push({
          chatId: message.chatId,
          contact: message.contact,
          contactModel: message.contactModel,
          lastMessage: message.lastMessage,
          timestamp: message.timestamp,
        });
      }
      chatlist.teacherId = message.teacherId;
      chatlist.studentId = message.studentId;
      await chatlist.save();
    } else {
      await ChatList.create({
        user: message.user,
        userModel: message.userModel,
        teacherId: message.teacherId,
        studentId: message.studentId,
        chats: [
          {
            chatId: message.chatId,
            contact: message.contact,
            contactModel: message.contactModel,
            lastMessage: message.lastMessage,
            timestamp: message.timestamp,
          },
        ],
      });
    }
  }

  async addReaction(messageId: string, userId: string, reaction: string): Promise<MessageEntity> {
    const message = await Message.findById(messageId);
    if (!message || message.isDeleted) throw new Error('Message not found or deleted');

    const existReaction = message.reactions.findIndex((r) => r.user.toString() === userId);
    if (existReaction !== -1) {
      message.reactions[existReaction].reaction = reaction;
    } else {
      message.reactions.push({ user: new mongoose.Types.ObjectId(userId), reaction });
    }

    await message.save();
    return new MessageEntity({
      id: message._id.toString(),
      chatId: message.chatId,
      sender: message.sender,
      senderModel: message.senderModel,
      receiver: message.receiver,
      receiverModel: message.receiverModel,
      message: message.message,
      mediaUrl: message.mediaUrl,
      replyTo: message.replyTo,
      reactions: message.reactions,
      timestamp: message.timestamp,
      isDeleted: message.isDeleted,
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<MessageEntity> {
    const message = await Message.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (message.sender.toString() !== userId) throw new Error('Unauthorized to delete this message');

    message.isDeleted = true;
    await message.save();

    return new MessageEntity({
      id: message._id.toString(),
      chatId: message.chatId,
      sender: message.sender,
      senderModel: message.senderModel,
      receiver: message.receiver,
      receiverModel: message.receiverModel,
      message: message.message,
      mediaUrl: message.mediaUrl,
      replyTo: message.replyTo,
      reactions: message.reactions,
      timestamp: message.timestamp,
      isDeleted: message.isDeleted,
    });
  }
}