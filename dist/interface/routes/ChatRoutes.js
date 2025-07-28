"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatRoutes = createChatRoutes;
// src/routes/chatRoutes.ts
const express_1 = require("express");
const ChatController_1 = require("../../interface/controllers/ChatController");
const ChatUseCase_1 = require("../../application/useCases/ChatUseCase");
const ChatRepository_1 = require("../../infrastructure/repositories/ChatRepository");
const NotificationRepository_1 = require("../../infrastructure/repositories/NotificationRepository");
const auth_1 = require("../middleware/auth");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = __importDefault(require("../../infrastructure/services/cloudinary"));
const mongoose_1 = require("mongoose");
// Configure multer storage for chat media uploads
const chatStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.default,
    params: async (req, res) => {
        return {
            folder: 'chat_media',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
            resource_type: 'auto',
            transformation: [
                { width: 1000, height: 1000, crop: 'limit' }, // Limit image size
                { quality: 'auto' } // Optimize quality
            ]
        };
    }
});
const upload = (0, multer_1.default)({
    storage: chatStorage,
    limits: {
        fileSize: 20 * 1024 * 1024, // 20MB limit
        files: 1
    },
});
// Middleware to validate chat ID
const validateChatId = (req, res, next) => {
    const chatId = req.params.chatId;
    if (chatId && !(0, mongoose_1.isValidObjectId)(chatId)) {
        return res.status(400).json({
            success: false,
            message: "Invalid chat ID format"
        });
    }
    next();
};
function createChatRoutes(io) {
    const router = (0, express_1.Router)();
    const chatRepository = new ChatRepository_1.ChatRepository();
    const notificationRepository = new NotificationRepository_1.NotificationRepository();
    const chatUseCase = new ChatUseCase_1.ChatUseCase(chatRepository, notificationRepository, io);
    const chatController = new ChatController_1.ChatController(chatUseCase);
    // Error handling middleware for multer
    const handleMulterError = (err, req, res, next) => {
        if (err instanceof multer_1.default.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    message: 'File size too large. Maximum size is 20MB',
                    success: false
                });
            }
            return res.status(400).json({
                message: err.message,
                success: false
            });
        }
        next(err);
    };
    // Send message - All authenticated users can send messages
    router.post('/send', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), upload.single('media'), handleMulterError, chatController.sendMessage.bind(chatController));
    // Initiate chat - All authenticated users can initiate chats
    router.post('/initiate', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), chatController.initiateChat.bind(chatController));
    // Get chat list - All authenticated users can view their chat list
    router.get('/chatlist', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), chatController.getChatList.bind(chatController));
    // Get messages from specific chat - All authenticated users can view messages
    router.get('/:chatId', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), validateChatId, chatController.getMessages.bind(chatController));
    // Add reaction - All authenticated users can add reactions
    router.post('/reaction', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), chatController.addReaction.bind(chatController));
    // Delete message - All authenticated users can delete their own messages
    router.post('/delete', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), chatController.deleteMessage.bind(chatController));
    // Upload media - All authenticated users can upload media
    router.post('/upload', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(['student', 'teacher', 'admin']), upload.single('media'), handleMulterError, chatController.uploadMedia.bind(chatController));
    return router;
}
//# sourceMappingURL=ChatRoutes.js.map