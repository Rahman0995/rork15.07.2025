import { z } from 'zod';
import { publicProcedure } from '../../../../backend/trpc/create-context';
import { mockChats, mockChatMessages, getUserChats, getChatMessages } from '../../../../constants/mockData';
import type { ChatMessage, Chat, MessageType } from '../../../../types';

export const getChatsProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }: { input: { userId: string } }) => {
    return getUserChats(input.userId);
  });

export const getChatByIdProcedure = publicProcedure
  .input(z.object({ chatId: z.string() }))
  .query(({ input }: { input: { chatId: string } }) => {
    const chat = mockChats.find((c: Chat) => c.id === input.chatId);
    if (!chat) {
      throw new Error('Chat not found');
    }
    return chat;
  });

export const getChatMessagesProcedure = publicProcedure
  .input(z.object({
    chatId: z.string(),
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
  }))
  .query(({ input }: { input: { chatId: string; limit: number; offset: number } }) => {
    const messages = getChatMessages(input.chatId);
    
    // Сортировка по времени (старые первыми)
    const sortedMessages = messages.sort((a: ChatMessage, b: ChatMessage) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    const paginatedMessages = sortedMessages.slice(
      input.offset, 
      input.offset + input.limit
    );
    
    return {
      messages: paginatedMessages,
      total: messages.length,
      hasMore: input.offset + input.limit < messages.length,
    };
  });

export const sendMessageProcedure = publicProcedure
  .input(z.object({
    chatId: z.string(),
    senderId: z.string(),
    text: z.string().optional(),
    type: z.enum(['text', 'image', 'file', 'voice']).default('text'),
    attachment: z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['image', 'file', 'voice']),
      url: z.string(),
      size: z.number().optional(),
      duration: z.number().optional(),
    }).optional(),
  }))
  .mutation(({ input }) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: input.senderId,
      text: input.text,
      type: input.type,
      attachment: input.attachment,
      createdAt: new Date().toISOString(),
      read: false,
    };
    
    // Добавляем сообщение в чат
    if (!mockChatMessages[input.chatId]) {
      mockChatMessages[input.chatId] = [];
    }
    mockChatMessages[input.chatId].push(newMessage);
    
    // Обновляем последнее сообщение в чате
    const chatIndex = mockChats.findIndex(chat => chat.id === input.chatId);
    if (chatIndex !== -1) {
      mockChats[chatIndex].lastMessage = newMessage;
      
      // Увеличиваем счетчик непрочитанных для других участников
      mockChats[chatIndex].unreadCount += 1;
    }
    
    return newMessage;
  });

export const markMessagesAsReadProcedure = publicProcedure
  .input(z.object({
    chatId: z.string(),
    userId: z.string(),
    messageIds: z.array(z.string()).optional(),
  }))
  .mutation(({ input }) => {
    const messages = mockChatMessages[input.chatId];
    if (!messages) {
      throw new Error('Chat not found');
    }
    
    let updatedCount = 0;
    
    messages.forEach(message => {
      // Отмечаем как прочитанные либо конкретные сообщения, либо все сообщения не от текущего пользователя
      if (message.senderId !== input.userId && !message.read) {
        if (!input.messageIds || input.messageIds.includes(message.id)) {
          message.read = true;
          updatedCount++;
        }
      }
    });
    
    // Обновляем счетчик непрочитанных в чате
    const chatIndex = mockChats.findIndex(chat => chat.id === input.chatId);
    if (chatIndex !== -1) {
      mockChats[chatIndex].unreadCount = Math.max(0, mockChats[chatIndex].unreadCount - updatedCount);
    }
    
    return { success: true, updatedCount };
  });

export const createChatProcedure = publicProcedure
  .input(z.object({
    participants: z.array(z.string()).min(2),
    isGroup: z.boolean().default(false),
    name: z.string().optional(),
  }))
  .mutation(({ input }) => {
    const newChat: Chat = {
      id: `chat_${Date.now()}`,
      participants: input.participants,
      isGroup: input.isGroup,
      unreadCount: 0,
      ...(input.name && { name: input.name }),
    };
    
    mockChats.push(newChat);
    mockChatMessages[newChat.id] = [];
    
    return newChat;
  });

export const deleteChatProcedure = publicProcedure
  .input(z.object({ chatId: z.string() }))
  .mutation(({ input }) => {
    const chatIndex = mockChats.findIndex(chat => chat.id === input.chatId);
    if (chatIndex === -1) {
      throw new Error('Chat not found');
    }
    
    const deletedChat = mockChats.splice(chatIndex, 1)[0];
    delete mockChatMessages[input.chatId];
    
    return { success: true, deletedChat };
  });

export const getUnreadCountProcedure = publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ input }) => {
    const userChats = getUserChats(input.userId);
    const totalUnread = userChats.reduce((total, chat) => total + chat.unreadCount, 0);
    
    return {
      totalUnread,
      chatCounts: userChats.map(chat => ({
        chatId: chat.id,
        unreadCount: chat.unreadCount,
      })),
    };
  });