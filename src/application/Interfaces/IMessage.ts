export interface IMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp?: Date;
  isRead?: boolean;
}