// Type definitions for the application
export type MessageType = 'text' | 'image' | 'file' | 'voice';

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'voice';
  url: string;
  size?: number;
  duration?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  type: MessageType;
  attachment?: MessageAttachment;
  createdAt: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isGroup: boolean;
  name?: string;
}