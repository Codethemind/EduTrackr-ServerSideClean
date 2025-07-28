"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_enum_1 = require("../../common/enums/http-status.enum");
class ChatController {
    constructor(chatUseCase) {
        this.chatUseCase = chatUseCase;
    }
    async initiateChat(req, res, next) {
        console.log('ChatController - initiateChat:', req.body);
        try {
            const { teacherId, studentId, initiatorId, receiverId, initiatorType } = req.body;
            let finalTeacherId;
            let finalStudentId;
            if (teacherId && studentId) {
                finalTeacherId = teacherId;
                finalStudentId = studentId;
            }
            else if (initiatorId && receiverId && initiatorType) {
                if (initiatorType === 'Student') {
                    finalStudentId = initiatorId;
                    finalTeacherId = receiverId;
                }
                else if (initiatorType === 'Teacher') {
                    finalTeacherId = initiatorId;
                    finalStudentId = receiverId;
                }
                else {
                    res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Invalid initiatorType', success: false });
                    return;
                }
            }
            else {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Required fields missing', success: false });
                return;
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(finalTeacherId) || !mongoose_1.default.Types.ObjectId.isValid(finalStudentId)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Invalid ID format', success: false });
                return;
            }
            const chatId = await this.chatUseCase.initiateChat(finalTeacherId, finalStudentId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ message: 'Chat initiated successfully', data: { chatId }, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async sendMessage(req, res, next) {
        try {
            const { chatId, sender, senderModel, receiver, receiverModel, message, replyTo } = req.body;
            const mediaUrl = req.file?.path;
            if (!chatId || !sender || !senderModel || !receiver || !receiverModel) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Missing required fields', success: false });
                return;
            }
            if (!message && !mediaUrl) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Message or media required', success: false });
                return;
            }
            if (!['Teacher', 'Student'].includes(senderModel) || !['Teacher', 'Student'].includes(receiverModel)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Invalid sender or receiver model', success: false });
                return;
            }
            const messageData = await this.chatUseCase.saveMessage(chatId, sender, senderModel, receiver, receiverModel, message, mediaUrl, replyTo);
            res.status(http_status_enum_1.HttpStatus.CREATED).json({ message: 'Message sent successfully', data: messageData, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async getMessages(req, res, next) {
        try {
            const { chatId } = req.params;
            const { userId } = req.query;
            if (!chatId || !userId) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Chat ID and User ID are required', success: false });
                return;
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(chatId) || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Invalid chat ID or user ID format', success: false });
                return;
            }
            const messages = await this.chatUseCase.getMessages(chatId, userId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ message: 'Messages retrieved successfully', data: messages, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async getChatList(req, res, next) {
        try {
            const { userId } = req.query;
            if (!userId || !mongoose_1.default.Types.ObjectId.isValid(userId)) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Invalid or missing User ID', success: false });
                return;
            }
            const chatList = await this.chatUseCase.getChatList(userId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ message: 'Chat list retrieved successfully', data: chatList, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async addReaction(req, res, next) {
        try {
            const { messageId, userId, reaction } = req.body;
            if (!messageId || !userId || !reaction) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Missing required fields', success: false });
                return;
            }
            const updatedMessage = await this.chatUseCase.addReaction(messageId, userId, reaction);
            res.status(http_status_enum_1.HttpStatus.OK).json({ message: 'Reaction added successfully', data: updatedMessage, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteMessage(req, res, next) {
        try {
            const { messageId, userId } = req.body;
            if (!messageId || !userId) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'Missing required fields', success: false });
                return;
            }
            const deletedMessage = await this.chatUseCase.deleteMessage(messageId, userId);
            res.status(http_status_enum_1.HttpStatus.OK).json({ message: 'Message deleted successfully', data: deletedMessage, success: true });
        }
        catch (error) {
            next(error);
        }
    }
    async uploadMedia(req, res, next) {
        try {
            if (!req.file) {
                res.status(http_status_enum_1.HttpStatus.BAD_REQUEST).json({ message: 'No file uploaded', success: false });
                return;
            }
            res.status(http_status_enum_1.HttpStatus.OK).json({
                message: 'File uploaded successfully',
                data: {
                    url: req.file.path,
                    filename: req.file.originalname,
                    mimetype: req.file.mimetype
                },
                success: true
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ChatController = ChatController;
//# sourceMappingURL=ChatController.js.map