"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatUseCase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_message_enum_1 = require("../../common/enums/http-message.enum");
const createHttpError_1 = require("../../common/utils/createHttpError");
const http_status_enum_1 = require("../../common/enums/http-status.enum");
class ChatUseCase {
    constructor(chatRepository, notificationRepository, io) {
        this.chatRepository = chatRepository;
        this.notificationRepository = notificationRepository;
        this.io = io;
    }
    async initiateChat(teacherId, studentId) {
        if (!mongoose_1.default.Types.ObjectId.isValid(teacherId) || !mongoose_1.default.Types.ObjectId.isValid(studentId)) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.INVALID_USER_ID, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const chatId = await this.chatRepository.initiateChat(teacherId, studentId);
            this.io.to(teacherId).emit('newChat', {
                chatId,
                contact: studentId,
                contactModel: 'Student',
                timestamp: new Date()
            });
            this.io.to(studentId).emit('newChat', {
                chatId,
                contact: teacherId,
                contactModel: 'Teacher',
                timestamp: new Date()
            });
            return chatId;
        }
        catch (error) {
            console.error(http_message_enum_1.ChatMessage.CHAT_INITIATION_FAILED, error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.CHAT_INITIATION_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async saveMessage(chatId, sender, senderModel, receiver, receiverModel, message, mediaUrl, mediaType, replyTo) {
        if (!chatId || !sender || !senderModel || !receiver || !receiverModel) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.MISSING_REQUIRED_FIELDS, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        if (!message && !mediaUrl) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.MESSAGE_OR_MEDIA_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        const messageData = {
            chatId,
            sender: new mongoose_1.default.Types.ObjectId(sender),
            senderModel,
            receiver: new mongoose_1.default.Types.ObjectId(receiver),
            receiverModel,
            message,
            mediaUrl,
            mediaType,
            replyTo: replyTo ? new mongoose_1.default.Types.ObjectId(replyTo) : undefined,
            timestamp: new Date()
        };
        try {
            const savedMessage = await this.chatRepository.saveMessage(messageData);
            await this.chatRepository.updateChatList(sender, {
                chatId,
                contact: receiver,
                contactModel: receiverModel,
                lastMessage: message || (mediaUrl ? 'Media message' : ''),
                timestamp: savedMessage.timestamp
            });
            await this.chatRepository.updateChatList(receiver, {
                chatId,
                contact: sender,
                contactModel: senderModel,
                lastMessage: message || (mediaUrl ? 'Media message' : ''),
                timestamp: savedMessage.timestamp
            });
            await this.chatRepository.incrementUnreadCount(receiver, chatId);
            await this.notificationRepository.createNotification({
                userId: new mongoose_1.default.Types.ObjectId(receiver),
                userModel: receiverModel,
                type: mediaUrl ? 'media' : 'message',
                title: `New message from ${senderModel}`,
                message: message || (mediaUrl ? 'Media message' : 'New message'),
                sender,
                senderModel,
                role: receiverModel,
                data: {
                    chatId,
                    messageId: savedMessage.id,
                    sender,
                    senderModel
                }
            });
            this.io.to(sender).emit('receiveMessage', savedMessage);
            this.io.to(receiver).emit('receiveMessage', savedMessage);
            this.io.to(chatId).emit('typing', { userId: sender, isTyping: false });
            return savedMessage;
        }
        catch (error) {
            console.error(http_message_enum_1.ChatMessage.MESSAGE_SAVE_FAILED, error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.MESSAGE_SAVE_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMessages(chatId, userId) {
        if (!chatId) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.CHAT_ID_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        try {
            const messages = await this.chatRepository.getMessages(chatId);
            await this.chatRepository.resetUnreadCount(userId, chatId);
            return messages;
        }
        catch (error) {
            console.error(http_message_enum_1.ChatMessage.MESSAGE_FETCH_FAILED, error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.MESSAGE_FETCH_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getChatList(userId) {
        if (!userId) {
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.USER_ID_REQUIRED, http_status_enum_1.HttpStatus.BAD_REQUEST);
        }
        try {
            return await this.chatRepository.getChatList(userId);
        }
        catch (error) {
            console.error(http_message_enum_1.ChatMessage.CHAT_LIST_FETCH_FAILED, error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.CHAT_LIST_FETCH_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async addReaction(messageId, userId, reaction) {
        try {
            const updatedMessage = await this.chatRepository.addReaction(messageId, userId, reaction);
            this.io.to(updatedMessage.sender.toString()).emit('messageReaction', {
                messageId: updatedMessage.id,
                reaction,
                userId
            });
            this.io.to(updatedMessage.receiver.toString()).emit('messageReaction', {
                messageId: updatedMessage.id,
                reaction,
                userId
            });
            return updatedMessage;
        }
        catch (error) {
            console.error(http_message_enum_1.ChatMessage.REACTION_FAILED, error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.REACTION_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteMessage(messageId, userId) {
        try {
            const deletedMessage = await this.chatRepository.deleteMessage(messageId, userId);
            this.io.to(deletedMessage.sender.toString()).emit('messageDeleted', {
                messageId: deletedMessage.id
            });
            this.io.to(deletedMessage.receiver.toString()).emit('messageDeleted', {
                messageId: deletedMessage.id
            });
            return deletedMessage;
        }
        catch (error) {
            console.error(http_message_enum_1.ChatMessage.MESSAGE_DELETE_FAILED, error);
            (0, createHttpError_1.createHttpError)(http_message_enum_1.ChatMessage.MESSAGE_DELETE_FAILED, http_status_enum_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    handleUserConnection(socket, userId, userModel) {
        console.log(`${http_message_enum_1.ChatMessage.USER_CONNECTED}: ${userId} (${userModel})`);
        socket.join(userId);
        this.chatRepository.getChatList(userId).then(chatList => {
            if (chatList) {
                chatList.chats.forEach(chat => {
                    socket.join(chat.chatId);
                });
            }
        }).catch(error => {
            console.error('Error joining existing chats:', error);
        });
    }
    handleUserDisconnection(userId, userModel) {
        console.log(`${http_message_enum_1.ChatMessage.USER_DISCONNECTED}: ${userId} (${userModel})`);
    }
    handleTyping(socket, chatId, userId, isTyping) {
        socket.to(chatId).emit('typing', { userId, isTyping });
    }
    handleSeen(socket, chatId, userId) {
        socket.to(chatId).emit('messageSeen', { userId, chatId });
    }
}
exports.ChatUseCase = ChatUseCase;
//# sourceMappingURL=ChatUseCase.js.map