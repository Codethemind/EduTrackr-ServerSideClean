"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const chat_models_1 = require("../../infrastructure/models/chat.models");
const Message_1 = __importDefault(require("../../domain/entities/Message"));
class ChatRepository {
    async initiateChat(teacherId, studentId) {
        console.log('Initiating chat between teacher:', teacherId, 'and student:', studentId);
        try {
            const chatId = new mongoose_1.default.Types.ObjectId().toString();
            const teacherObjectId = new mongoose_1.default.Types.ObjectId(teacherId);
            const studentObjectId = new mongoose_1.default.Types.ObjectId(studentId);
            // Check if chat already exists for this teacher-student pair in teacher's ChatList
            const existingTeacherChatList = await chat_models_1.ChatList.findOne({
                user: teacherObjectId,
                userModel: 'Teacher',
                'chats.contact': studentObjectId
            });
            if (existingTeacherChatList) {
                // Find the chatId for this pair
                const chat = existingTeacherChatList.chats.find((c) => c.contact.toString() === studentObjectId.toString());
                if (chat) {
                    console.log(`initiateChat: Chat already exists for teacher (${teacherId}) and student (${studentId}), chatId: ${chat.chatId}`);
                    return chat.chatId;
                }
            }
            // Add chat to teacher's ChatList (create if not exists)
            await chat_models_1.ChatList.findOneAndUpdate({ user: teacherObjectId, userModel: 'Teacher' }, {
                $push: {
                    chats: {
                        chatId,
                        contact: studentObjectId,
                        contactModel: 'Student',
                        lastMessage: '',
                        timestamp: new Date(),
                        unreadCount: 0
                    }
                },
                $setOnInsert: {
                    teacherId: teacherObjectId,
                    studentId: studentObjectId
                }
            }, { upsert: true, new: true });
            console.log(`initiateChat: Updated ChatList for teacher: ${teacherId}`);
            // Add chat to student's ChatList (create if not exists)
            await chat_models_1.ChatList.findOneAndUpdate({ user: studentObjectId, userModel: 'Student' }, {
                $push: {
                    chats: {
                        chatId,
                        contact: teacherObjectId,
                        contactModel: 'Teacher',
                        lastMessage: '',
                        timestamp: new Date(),
                        unreadCount: 0
                    }
                },
                $setOnInsert: {
                    teacherId: teacherObjectId,
                    studentId: studentObjectId
                }
            }, { upsert: true, new: true });
            console.log(`initiateChat: Updated ChatList for student: ${studentId}`);
            return chatId;
        }
        catch (error) {
            console.error('Error in initiateChat:', error);
            throw new Error('Failed to initiate chat');
        }
    }
    async saveMessage(message) {
        try {
            const senderObjectId = message.sender
                ? new mongoose_1.default.Types.ObjectId(message.sender.toString())
                : undefined;
            const receiverObjectId = message.receiver
                ? new mongoose_1.default.Types.ObjectId(message.receiver.toString())
                : undefined;
            const replyToObjectId = message.replyTo
                ? new mongoose_1.default.Types.ObjectId(message.replyTo.toString())
                : undefined;
            if (!senderObjectId || !receiverObjectId) {
                throw new Error('Sender and receiver IDs are required');
            }
            console.log('Saving message with data:', {
                chatId: message.chatId,
                sender: senderObjectId,
                senderModel: message.senderModel,
                receiver: receiverObjectId,
                receiverModel: message.receiverModel,
                message: message.message,
                mediaUrl: message.mediaUrl,
                mediaType: message.mediaType,
                replyTo: replyToObjectId
            });
            const savedMessage = await chat_models_1.Message.create({
                chatId: message.chatId,
                sender: senderObjectId,
                senderModel: message.senderModel,
                receiver: receiverObjectId,
                receiverModel: message.receiverModel,
                message: message.message || undefined,
                mediaUrl: message.mediaUrl || undefined,
                mediaType: message.mediaType || undefined,
                replyTo: replyToObjectId,
                timestamp: message.timestamp || new Date(),
                isDeleted: false,
            });
            // Update chat lists using the updateChatList method
            const lastMessage = message.message || (message.mediaUrl ? 'Media sent' : '');
            // Update sender's chat list
            await this.updateChatList(senderObjectId.toString(), {
                chatId: message.chatId,
                contact: receiverObjectId.toString(),
                contactModel: message.receiverModel,
                lastMessage,
                timestamp: savedMessage.timestamp
            });
            // Update receiver's chat list
            await this.updateChatList(receiverObjectId.toString(), {
                chatId: message.chatId,
                contact: senderObjectId.toString(),
                contactModel: message.senderModel,
                lastMessage,
                timestamp: savedMessage.timestamp
            });
            return new Message_1.default({
                id: savedMessage._id.toString(),
                chatId: savedMessage.chatId,
                sender: savedMessage.sender,
                senderModel: savedMessage.senderModel,
                receiver: savedMessage.receiver,
                receiverModel: savedMessage.receiverModel,
                message: savedMessage.message,
                mediaUrl: savedMessage.mediaUrl,
                mediaType: savedMessage.mediaType,
                replyTo: savedMessage.replyTo,
                reactions: savedMessage.reactions,
                timestamp: savedMessage.timestamp,
                isDeleted: savedMessage.isDeleted,
            });
        }
        catch (error) {
            console.error('Error in saveMessage:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to save message: ${errorMessage}`);
        }
    }
    async getMessages(chatId) {
        try {
            if (!chatId) {
                throw new Error('Chat ID is required');
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(chatId)) {
                throw new Error('Invalid chat ID format');
            }
            console.log('ChatRepository - getMessages:', { chatId });
            const messages = await chat_models_1.Message.find({
                chatId,
                isDeleted: false
            })
                .populate('sender', 'name username')
                .populate('receiver', 'name username')
                .populate({
                path: 'replyTo',
                select: 'message mediaUrl sender senderModel',
                populate: {
                    path: 'sender',
                    select: 'name username'
                }
            })
                .sort({ timestamp: 1 })
                .lean();
            console.log(`Found ${messages.length} messages for chat:`, chatId);
            // Convert MongoDB documents to MessageEntity instances
            return messages.map(message => new Message_1.default({
                id: message._id.toString(),
                chatId: message.chatId,
                sender: message.sender,
                senderModel: message.senderModel,
                receiver: message.receiver,
                receiverModel: message.receiverModel,
                message: message.message,
                mediaUrl: message.mediaUrl,
                mediaType: message.mediaType,
                replyTo: message.replyTo,
                reactions: message.reactions || [],
                timestamp: message.timestamp,
                isDeleted: message.isDeleted || false,
            }));
        }
        catch (error) {
            console.error('Error in ChatRepository.getMessages:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to fetch messages: ${errorMessage}`);
        }
    }
    async getChatList(userId) {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
                throw new Error('Invalid user ID format');
            }
            console.log('ChatRepository - getChatList:', { userId });
            const chatList = await chat_models_1.ChatList.findOne({ user: userId })
                .populate({
                path: 'chats.contact',
                select: 'firstname lastname username profileImage email username'
            })
                .lean();
            if (!chatList) {
                console.log('No chat list found for user:', userId);
                return null;
            }
            console.log('Found chat list:', {
                id: chatList._id,
                user: chatList.user,
                chatsCount: chatList.chats.length
            });
            return chatList;
        }
        catch (error) {
            console.error('Error in ChatRepository.getChatList:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to fetch chat list: ${errorMessage}`);
        }
    }
    async addReaction(messageId, userId, reaction) {
        try {
            if (!mongoose_1.default.Types.ObjectId.isValid(messageId)) {
                throw new Error('Invalid message ID format');
            }
            const message = await chat_models_1.Message.findById(messageId);
            if (!message) {
                throw new Error(`Message with ID ${messageId} not found`);
            }
            if (message.isDeleted) {
                throw new Error(`Message with ID ${messageId} has been deleted`);
            }
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            const existingReactionIndex = message.reactions.findIndex(r => r.user.toString() === userId);
            if (existingReactionIndex !== -1) {
                message.reactions[existingReactionIndex].reaction = reaction;
            }
            else {
                message.reactions.push({ user: userObjectId, reaction });
            }
            await message.save();
            return new Message_1.default({
                id: message._id.toString(),
                chatId: message.chatId,
                sender: message.sender,
                senderModel: message.senderModel,
                receiver: message.receiver,
                receiverModel: message.receiverModel,
                message: message.message,
                mediaUrl: message.mediaUrl,
                mediaType: message.mediaType,
                replyTo: message.replyTo,
                reactions: message.reactions,
                timestamp: message.timestamp,
                isDeleted: message.isDeleted,
            });
        }
        catch (error) {
            console.error('Error in addReaction:', error);
            if (error instanceof Error) {
                throw error; // Re-throw the original error to preserve the error message
            }
            throw new Error('Failed to add reaction');
        }
    }
    async deleteMessage(messageId, userId) {
        try {
            const message = await chat_models_1.Message.findById(messageId);
            if (!message) {
                throw new Error('Message not found');
            }
            if (message.sender.toString() !== userId) {
                throw new Error('Unauthorized to delete this message');
            }
            message.isDeleted = true;
            await message.save();
            return new Message_1.default({
                id: message._id.toString(),
                chatId: message.chatId,
                sender: message.sender,
                senderModel: message.senderModel,
                receiver: message.receiver,
                receiverModel: message.receiverModel,
                message: message.message,
                mediaUrl: message.mediaUrl,
                mediaType: message.mediaType,
                replyTo: message.replyTo,
                reactions: message.reactions,
                timestamp: message.timestamp,
                isDeleted: message.isDeleted,
            });
        }
        catch (error) {
            console.error('Error in deleteMessage:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to delete message: ${errorMessage}`);
        }
    }
    async incrementUnreadCount(userId, chatId) {
        try {
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            await chat_models_1.ChatList.updateOne({
                user: userObjectId,
                'chats.chatId': chatId
            }, {
                $inc: { 'chats.$.unreadCount': 1 }
            });
        }
        catch (error) {
            console.error('Error in incrementUnreadCount:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to increment unread count: ${errorMessage}`);
        }
    }
    async updateChatList(userId, chatData) {
        try {
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            const contactObjectId = new mongoose_1.default.Types.ObjectId(chatData.contact);
            // Try to update existing chat
            const updateResult = await chat_models_1.ChatList.updateOne({
                user: userObjectId,
                'chats.chatId': chatData.chatId
            }, {
                $set: {
                    'chats.$.lastMessage': chatData.lastMessage,
                    'chats.$.timestamp': chatData.timestamp
                }
            });
            // If no existing chat was updated, this means we need to add a new chat entry
            if (updateResult.matchedCount === 0) {
                await chat_models_1.ChatList.updateOne({ user: userObjectId }, {
                    $push: {
                        chats: {
                            chatId: chatData.chatId,
                            contact: contactObjectId,
                            contactModel: chatData.contactModel,
                            lastMessage: chatData.lastMessage,
                            timestamp: chatData.timestamp,
                            unreadCount: 0
                        }
                    }
                }, { upsert: true });
            }
        }
        catch (error) {
            console.error('Error in updateChatList:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to update chat list: ${errorMessage}`);
        }
    }
    async resetUnreadCount(userId, chatId) {
        try {
            const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
            await chat_models_1.ChatList.updateOne({
                user: userObjectId,
                'chats.chatId': chatId
            }, {
                $set: { 'chats.$.unreadCount': 0 }
            });
        }
        catch (error) {
            console.error('Error in resetUnreadCount:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to reset unread count: ${errorMessage}`);
        }
    }
    async saveChatList(chatList) {
        try {
            // This method would depend on your Chatlist entity structure
            // Since it's not fully implemented in your original code, here's a basic implementation
            const savedChatList = await chat_models_1.ChatList.create(chatList);
            return savedChatList;
        }
        catch (error) {
            console.error('Error in saveChatList:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to save chat list: ${errorMessage}`);
        }
    }
}
exports.ChatRepository = ChatRepository;
//# sourceMappingURL=ChatRepository.js.map