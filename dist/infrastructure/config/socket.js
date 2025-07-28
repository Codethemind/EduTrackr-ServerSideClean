"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const ChatUseCase_1 = require("../../application/useCases/ChatUseCase");
const ChatRepository_1 = require("../../infrastructure/repositories/ChatRepository");
const NotificationRepository_1 = require("../../infrastructure/repositories/NotificationRepository");
function initializeSocket(io) {
    const chatRepository = new ChatRepository_1.ChatRepository();
    const notificationRepository = new NotificationRepository_1.NotificationRepository();
    const chatUseCase = new ChatUseCase_1.ChatUseCase(chatRepository, notificationRepository, io);
    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        const userModel = socket.handshake.auth.userModel;
        const token = socket.handshake.auth.token;
        console.log('Socket auth attempt:', { userId, userModel, token });
        if (userId && ['Teacher', 'Student'].includes(userModel) && token) {
            socket.data.userId = userId;
            socket.data.userModel = userModel;
            next();
        }
        else {
            console.error('Socket authentication failed:', { userId, userModel, token });
            next(new Error('Authentication error: Missing or invalid userId, userModel, or token'));
        }
    });
    io.on('connection', (socket) => {
        const { userId, userModel } = socket.data;
        chatUseCase.handleUserConnection(socket, userId, userModel);
        socket.on('sendMessage', async (data, callback) => {
            try {
                if (!data.chatId || !data.receiver || !data.receiverModel || !data.message) {
                    throw new Error('Missing required fields: chatId, receiver, receiverModel, or message');
                }
                const newMessage = await chatUseCase.saveMessage(data.chatId, userId, userModel, data.receiver, data.receiverModel, data.message, undefined, undefined, data.replyTo);
                socket.emit('messageSent', newMessage);
                if (callback && typeof callback === 'function') {
                    callback({ success: true, data: newMessage });
                }
            }
            catch (error) {
                console.error('Error in sendMessage:', error.message, error.stack);
                socket.emit('error', { message: error.message || 'Failed to send message' });
                if (callback && typeof callback === 'function') {
                    callback({ success: false, error: error.message || 'Failed to send message' });
                }
            }
        });
        socket.on('sendMedia', async (data, callback) => {
            try {
                if (!data.chatId || !data.receiver || !data.receiverModel || !data.mediaUrl) {
                    throw new Error('Missing required fields: chatId, receiver, receiverModel, or mediaUrl');
                }
                const newMessage = await chatUseCase.saveMessage(data.chatId, userId, userModel, data.receiver, data.receiverModel, data.message || '', data.mediaUrl, data.mediaType, data.replyTo);
                socket.emit('messageSent', newMessage);
                if (callback && typeof callback === 'function') {
                    callback({ success: true, data: newMessage });
                }
            }
            catch (error) {
                console.error('Error in sendMedia:', error.message, error.stack);
                socket.emit('error', { message: error.message || 'Failed to send media' });
                if (callback && typeof callback === 'function') {
                    callback({ success: false, error: error.message || 'Failed to send media' });
                }
            }
        });
        socket.on('addReaction', async (data, callback) => {
            try {
                if (!data.messageId || !data.reaction) {
                    throw new Error('Missing required fields: messageId or reaction');
                }
                const updatedMessage = await chatUseCase.addReaction(data.messageId, userId, data.reaction);
                socket.emit('messageReaction', updatedMessage);
                if (callback && typeof callback === 'function') {
                    callback({ success: true, data: updatedMessage });
                }
            }
            catch (error) {
                console.error('Error in addReaction:', error.message, error.stack);
                socket.emit('error', { message: error.message || 'Failed to add reaction' });
                if (callback && typeof callback === 'function') {
                    callback({ success: false, error: error.message || 'Failed to add reaction' });
                }
            }
        });
        socket.on('deleteMessage', async (data, callback) => {
            try {
                if (!data.messageId) {
                    throw new Error('Missing required field: messageId');
                }
                const deletedMessage = await chatUseCase.deleteMessage(data.messageId, userId);
                socket.emit('messageDeleted', deletedMessage);
                if (callback && typeof callback === 'function') {
                    callback({ success: true, data: deletedMessage });
                }
            }
            catch (error) {
                console.error('Error in deleteMessage:', error.message, error.stack);
                socket.emit('error', { message: error.message || 'Failed to delete message' });
                if (callback && typeof callback === 'function') {
                    callback({ success: false, error: error.message || 'Failed to delete message' });
                }
            }
        });
        socket.on('getMessages', async (data, callback) => {
            try {
                if (!data.chatId) {
                    throw new Error('Missing required field: chatId');
                }
                const messages = await chatUseCase.getMessages(data.chatId, userId);
                if (callback && typeof callback === 'function') {
                    callback({ success: true, data: messages });
                }
            }
            catch (error) {
                console.error('Error in getMessages:', error.message, error.stack);
                socket.emit('error', { message: error.message || 'Failed to get messages' });
                if (callback && typeof callback === 'function') {
                    callback({ success: false, error: error.message || 'Failed to get messages' });
                }
            }
        });
        socket.on('disconnect', () => {
            chatUseCase.handleUserDisconnection(userId, userModel);
        });
    });
}
//# sourceMappingURL=socket.js.map