import { create } from 'zustand';
import { Chat, ChatMessage, MessageType, MessageAttachment, UserStatus } from '@/types';
import { mockChats, mockChatMessages } from '@/constants/mockData';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

interface ChatState {
  chats: Chat[];
  messages: Record<string, ChatMessage[]>;
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  userStatuses: Record<string, UserStatus>;
  isRecording: boolean;
  recordingDuration: number;
  fetchChats: (userId: string) => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, senderId: string, text: string, type?: MessageType, attachment?: MessageAttachment) => Promise<void>;
  sendImageMessage: (chatId: string, senderId: string) => Promise<void>;
  sendFileMessage: (chatId: string, senderId: string) => Promise<void>;
  startVoiceRecording: () => Promise<void>;
  stopVoiceRecording: (chatId: string, senderId: string) => Promise<void>;
  setCurrentChat: (chatId: string) => void;
  markAsRead: (chatId: string) => Promise<void>;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  getUserStatus: (userId: string) => UserStatus | null;
  createChat: (participants: string[], isGroup?: boolean, name?: string) => Promise<string>;
  deleteMessage: (chatId: string, messageId: string) => Promise<void>;
  editMessage: (chatId: string, messageId: string, newText: string) => Promise<void>;
  searchMessages: (query: string) => ChatMessage[];
  getUnreadCount: (userId: string) => number;
  clearChat: (chatId: string) => Promise<void>;
}

let recording: Audio.Recording | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  messages: {},
  currentChatId: null,
  isLoading: false,
  error: null,
  userStatuses: {},
  isRecording: false,
  recordingDuration: 0,
  fetchChats: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userChats = mockChats.filter(chat => 
        chat.participants.includes(userId) || 
        (chat.isGroup && chat.participants.includes(userId))
      );
      
      set({ chats: userChats, isLoading: false });
    } catch (error) {
      set({ error: 'Ошибка при загрузке чатов', isLoading: false });
    }
  },
  fetchMessages: async (chatId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const chatMessages = mockChatMessages[chatId] || [];
      
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: chatMessages,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Ошибка при загрузке сообщений', isLoading: false });
    }
  },
  sendMessage: async (chatId: string, senderId: string, text: string, type: MessageType = 'text', attachment?: MessageAttachment) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMessage: ChatMessage = {
        id: `${Date.now()}`,
        senderId,
        text: type === 'text' ? text : undefined,
        type,
        attachment,
        createdAt: new Date().toISOString(),
        read: false,
      };
      
      set(state => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = {
          ...state.messages,
          [chatId]: [...chatMessages, newMessage],
        };
        
        const updatedChats = state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              lastMessage: newMessage,
            };
          }
          return chat;
        });
        
        return {
          messages: updatedMessages,
          chats: updatedChats,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Ошибка при отправке сообщения', isLoading: false });
    }
  },
  sendImageMessage: async (chatId: string, senderId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachment: MessageAttachment = {
          id: `${Date.now()}`,
          name: asset.fileName || 'image.jpg',
          type: 'image',
          url: asset.uri,
          size: asset.fileSize,
        };
        
        await get().sendMessage(chatId, senderId, '', 'image', attachment);
      }
    } catch (error) {
      set({ error: 'Ошибка при отправке изображения' });
    }
  },
  sendFileMessage: async (chatId: string, senderId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const attachment: MessageAttachment = {
          id: `${Date.now()}`,
          name: asset.name,
          type: 'file',
          url: asset.uri,
          size: asset.size,
        };
        
        await get().sendMessage(chatId, senderId, '', 'file', attachment);
      }
    } catch (error) {
      set({ error: 'Ошибка при отправке файла' });
    }
  },
  startVoiceRecording: async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          set({ error: 'Необходимо разрешение на запись аудио' });
          return;
        }
        
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.wav',
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
        
        await recording.startAsync();
        set({ isRecording: true, recordingDuration: 0 });
        
        // Start duration timer
        const timer = setInterval(() => {
          set(state => ({ recordingDuration: state.recordingDuration + 1 }));
        }, 1000);
        
        // Store timer reference for cleanup
        (recording as any).timer = timer;
      } else {
        // Web implementation would use MediaRecorder API
        set({ error: 'Запись голоса недоступна в веб-версии' });
      }
    } catch (error) {
      set({ error: 'Ошибка при начале записи', isRecording: false });
    }
  },
  stopVoiceRecording: async (chatId: string, senderId: string) => {
    try {
      if (recording && Platform.OS !== 'web') {
        await recording.stopAndUnloadAsync();
        
        // Clear timer
        if ((recording as any).timer) {
          clearInterval((recording as any).timer);
        }
        
        const uri = recording.getURI();
        const duration = get().recordingDuration;
        
        if (uri && duration > 0) {
          const attachment: MessageAttachment = {
            id: `${Date.now()}`,
            name: 'voice_message.m4a',
            type: 'voice',
            url: uri,
            duration,
          };
          
          await get().sendMessage(chatId, senderId, '', 'voice', attachment);
        }
        
        recording = null;
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }
      
      set({ isRecording: false, recordingDuration: 0 });
    } catch (error) {
      set({ error: 'Ошибка при остановке записи', isRecording: false, recordingDuration: 0 });
    }
  },
  setCurrentChat: (chatId: string) => {
    set({ currentChatId: chatId });
  },
  markAsRead: async (chatId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = chatMessages.map(msg => ({ ...msg, read: true }));
        
        const updatedChats = state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              unreadCount: 0,
            };
          }
          return chat;
        });
        
        return {
          messages: {
            ...state.messages,
            [chatId]: updatedMessages,
          },
          chats: updatedChats,
        };
      });
    } catch (error) {
      set({ error: 'Ошибка при отметке сообщений как прочитанных' });
    }
  },
  updateUserStatus: (userId: string, isOnline: boolean) => {
    set(state => ({
      userStatuses: {
        ...state.userStatuses,
        [userId]: {
          userId,
          isOnline,
          lastSeen: isOnline ? undefined : new Date().toISOString(),
        },
      },
    }));
  },
  getUserStatus: (userId: string) => {
    const state = get();
    return state.userStatuses[userId] || null;
  },
  
  createChat: async (participants: string[], isGroup = false, name?: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const chatId = `chat_${Date.now()}`;
      const newChat: Chat = {
        id: chatId,
        participants,
        isGroup,
        name,
        unreadCount: 0,
      };
      
      set(state => ({
        chats: [newChat, ...state.chats],
        messages: {
          ...state.messages,
          [chatId]: [],
        },
        isLoading: false,
      }));
      
      return chatId;
    } catch (error) {
      set({ error: 'Ошибка при создании чата', isLoading: false });
      throw error;
    }
  },
  
  deleteMessage: async (chatId: string, messageId: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = chatMessages.filter(msg => msg.id !== messageId);
        
        return {
          messages: {
            ...state.messages,
            [chatId]: updatedMessages,
          },
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Ошибка при удалении сообщения', isLoading: false });
    }
  },
  
  editMessage: async (chatId: string, messageId: string, newText: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => {
        const chatMessages = state.messages[chatId] || [];
        const updatedMessages = chatMessages.map(msg => 
          msg.id === messageId ? { ...msg, text: newText } : msg
        );
        
        return {
          messages: {
            ...state.messages,
            [chatId]: updatedMessages,
          },
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Ошибка при редактировании сообщения', isLoading: false });
    }
  },
  
  searchMessages: (query: string) => {
    const { messages } = get();
    const allMessages: ChatMessage[] = [];
    
    Object.values(messages).forEach(chatMessages => {
      allMessages.push(...chatMessages);
    });
    
    const lowercaseQuery = query.toLowerCase();
    return allMessages.filter(message => 
      message.text?.toLowerCase().includes(lowercaseQuery) ||
      message.attachment?.name.toLowerCase().includes(lowercaseQuery)
    );
  },
  
  getUnreadCount: (userId: string) => {
    const { chats } = get();
    return chats
      .filter(chat => chat.participants.includes(userId))
      .reduce((total, chat) => total + chat.unreadCount, 0);
  },
  
  clearChat: async (chatId: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set(state => ({
        messages: {
          ...state.messages,
          [chatId]: [],
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Ошибка при очистке чата', isLoading: false });
    }
  },
}));

// Simulate user status updates
setInterval(() => {
  const store = useChatStore.getState();
  const userIds = ['user1', 'user2', 'user3', 'user4', 'user5'];
  
  userIds.forEach(userId => {
    const isOnline = Math.random() > 0.3; // 70% chance of being online
    store.updateUserStatus(userId, isOnline);
  });
}, 30000); // Update every 30 seconds