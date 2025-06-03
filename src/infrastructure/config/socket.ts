import { Server, Socket } from 'socket.io';
import { ChatUseCase } from '../../application/useCases/ChatUseCase';
import { ChatRepository } from '../../infrastructure/repositories/ChatRepository';

export function initializeSocket(io: Server) {
  const chatRepository = new ChatRepository();
  const chatUseCase = new ChatUseCase(chatRepository, io);

  io.use((socket: Socket, next) => {
    const userId = socket.handshake.auth.userId;
    const userModel = socket.handshake.auth.userModel;
    const token = socket.handshake.auth.token;
    console.log('Socket auth attempt:', { userId, userModel, token });
    if (userId && ['Teacher', 'Student'].includes(userModel) && token) {
      socket.data.userId = userId;
      socket.data.userModel = userModel;
      next();
    } else {
      console.error('Socket authentication failed:', { userId, userModel, token });
      next(new Error('Authentication error: Missing or invalid userId, userModel, or token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const { userId, userModel } = socket.data;
    chatUseCase.handleUserConnection(socket, userId, userModel);

    socket.on('sendMessage', async (data: { chatId: string; receiver: string; receiverModel: 'Teacher' | 'Student'; message: string; replyTo?: string }, callback) => {
      try {
        const newMessage = await chatUseCase.saveMessage(
          data.chatId,
          userId,
          userModel,
          data.receiver,
          data.receiverModel,
          data.message,
          undefined,
          data.replyTo
        );
        socket.emit('messageSent', newMessage);
        callback(newMessage);
      } catch (error: any) {
        console.error('Error in sendMessage:', error.message, error.stack);
        socket.emit('error', { message: error.message });
        callback({ error: error.message });
      }
    });

    socket.on('sendMedia', async (data: { chatId: string; receiver: string; receiverModel: 'Teacher' | 'Student'; mediaUrl: string; message?: string; replyTo?: string }, callback) => {
      try {
        const newMessage = await chatUseCase.saveMessage(
          data.chatId,
          userId,
          userModel,
          data.receiver,
          data.receiverModel,
          data.message || '',
          data.mediaUrl,
          data.replyTo
        );
        socket.emit('messageSent', newMessage);
        callback(newMessage);
      } catch (error: any) {
        console.error('Error in sendMedia:', error.message, error.stack);
        socket.emit('error', { message: error.message });
        callback({ error: error.message });
      }
    });

    socket.on('addReaction', async (data: { messageId: string; reaction: string }, callback) => {
      try {
        const updatedMessage = await chatUseCase.addReaction(data.messageId, userId, data.reaction);
        socket.emit('messageReaction', updatedMessage);
        callback(updatedMessage);
      } catch (error: any) {
        console.error('Error in addReaction:', error.message, error.stack);
        socket.emit('error', { message: error.message });
        callback({ error: error.message });
      }
    });

    socket.on('deleteMessage', async (data: { messageId: string }, callback) => {
      try {
        const deletedMessage = await chatUseCase.deleteMessage(data.messageId, userId);
        socket.emit('messageDeleted', deletedMessage);
        callback(deletedMessage);
      } catch (error: any) {
        console.error('Error in deleteMessage:', error.message, error.stack);
        socket.emit('error', { message: error.message });
        callback({ error: error.message });
      }
    });

    socket.on('getMessages', async (data: { chatId: string }, callback) => {
      try {
        const messages = await chatUseCase.getMessages(data.chatId);
        callback(messages);
      } catch (error: any) {
        console.error('Error in getMessages:', error.message, error.stack);
        socket.emit('error', { message: error.message });
        callback({ error: error.message });
      }
    });

    socket.on('disconnect', () => {
      chatUseCase.handleUserDisconnection(userId, userModel);
    });
  });
}