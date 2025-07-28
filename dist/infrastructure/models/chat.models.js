"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatList = exports.Message = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const MessageSchema = new mongoose_1.Schema({
    chatId: { type: String, required: true, index: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
    senderModel: { type: String, enum: ['Teacher', 'Student'], required: true },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, required: true, refPath: 'receiverModel' },
    receiverModel: { type: String, enum: ['Teacher', 'Student'], required: true },
    message: { type: String },
    mediaUrl: { type: String },
    mediaType: { type: String, enum: ['image', 'document', 'video'] },
    replyTo: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [
        {
            user: { type: mongoose_1.Schema.Types.ObjectId, required: true },
            reaction: { type: String, enum: ['❤️', '😂', '😢', '💯', '👍', '👎'], required: true },
        },
    ],
    timestamp: { type: Date, default: Date.now, index: true },
    isDeleted: { type: Boolean, default: false },
});
// Add compound indexes for better query performance
MessageSchema.index({ chatId: 1, timestamp: -1 });
MessageSchema.index({ sender: 1, receiver: 1 });
const ChatListSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, refPath: 'userModel' },
    userModel: { type: String, enum: ['Teacher', 'Student'], required: true },
    teacherId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Teacher' },
    studentId: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'Student' },
    chats: [
        {
            chatId: { type: String, required: true },
            contact: { type: mongoose_1.Schema.Types.ObjectId, required: true, refPath: 'chats.contactModel' },
            contactModel: { type: String, enum: ['Teacher', 'Student'], required: true },
            lastMessage: { type: String, default: '' },
            timestamp: { type: Date, default: Date.now },
            unreadCount: { type: Number, default: 0 }
        },
    ],
});
// Add indexes for better query performance
ChatListSchema.index({ user: 1, userModel: 1 });
ChatListSchema.index({ teacherId: 1, studentId: 1 }, { unique: true });
ChatListSchema.index({ 'chats.chatId': 1 });
// Add a method to update chat list
ChatListSchema.methods.updateChat = async function (chatData) {
    const chatIndex = this.chats.findIndex((chat) => chat.chatId === chatData.chatId &&
        chat.contact.toString() === chatData.contact.toString());
    if (chatIndex !== -1) {
        this.chats[chatIndex].lastMessage = chatData.lastMessage;
        this.chats[chatIndex].timestamp = chatData.timestamp;
        // Reset unread count for the sender
        this.chats[chatIndex].unreadCount = 0;
    }
    else {
        this.chats.push({
            ...chatData,
            unreadCount: 0
        });
    }
    return this.save();
};
// Add a method to increment unread count
ChatListSchema.methods.incrementUnreadCount = async function (chatId) {
    const chatIndex = this.chats.findIndex((chat) => chat.chatId === chatId);
    if (chatIndex !== -1) {
        this.chats[chatIndex].unreadCount += 1;
        return this.save();
    }
};
exports.Message = mongoose_1.default.model('Message', MessageSchema);
exports.ChatList = mongoose_1.default.model('ChatList', ChatListSchema);
//# sourceMappingURL=chat.models.js.map