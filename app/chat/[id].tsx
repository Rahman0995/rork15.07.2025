import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { ChatMessage } from '@/components/ChatMessage';
import { Avatar } from '@/components/Avatar';
import { Input } from '@/components/Input';
import { colors } from '@/constants/colors';
import { getUser } from '@/constants/mockData';
import { ArrowLeft, Send, Info, Phone, Paperclip, Image, Mic, MicOff } from 'lucide-react-native';

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { 
    chats, 
    messages, 
    fetchMessages, 
    sendMessage,
    sendImageMessage,
    sendFileMessage,
    startVoiceRecording,
    stopVoiceRecording,
    isLoading, 
    markAsRead,
    getUserStatus,
    isRecording,
    recordingDuration,
    error
  } = useChatStore();
  const { user } = useAuthStore();
  const [messageText, setMessageText] = useState('');
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  
  const chat = chats.find(c => c.id === id);
  const chatMessages = messages[id] || [];
  
  useEffect(() => {
    if (id) {
      fetchMessages(id);
      markAsRead(id);
    }
  }, [id]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatMessages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [chatMessages]);
  
  const handleSend = async () => {
    if (!messageText.trim() || !user || !id) return;
    
    try {
      await sendMessage(id, user.id, messageText.trim());
      setMessageText('');
    } catch (error) {
      Alert.alert(
        'Ошибка отправки',
        'Не удалось отправить сообщение. Проверьте подключение к интернету.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleAttachmentPress = () => {
    setShowAttachmentOptions(!showAttachmentOptions);
  };
  
  const handleImagePicker = async () => {
    setShowAttachmentOptions(false);
    if (user && id) {
      await sendImageMessage(id, user.id);
    }
  };
  
  const handleFilePicker = async () => {
    setShowAttachmentOptions(false);
    if (user && id) {
      await sendFileMessage(id, user.id);
    }
  };
  
  const handleVoiceRecording = async () => {
    if (isRecording) {
      if (user && id) {
        await stopVoiceRecording(id, user.id);
      }
    } else {
      await startVoiceRecording();
    }
  };
  
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!chat || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  // For direct chats, get the other participant
  const otherParticipantId = chat.isGroup 
    ? null 
    : chat.participants.find(participantId => participantId !== user.id);
  
  const otherUser = otherParticipantId ? getUser(otherParticipantId) : null;
  const chatName = chat.isGroup ? chat.name : otherUser?.name;
  const userStatus = otherParticipantId ? getUserStatus(otherParticipantId) : null;
  
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.headerInfo}>
        <Avatar 
          uri={chat.isGroup ? undefined : otherUser?.avatar} 
          name={chatName || 'Чат'} 
          size={40} 
          showBadge={!chat.isGroup}
          online={userStatus?.isOnline || false}
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{chatName}</Text>
          <Text style={styles.headerSubtitle}>
            {chat.isGroup 
              ? `${chat.participants.length} участников` 
              : userStatus?.isOnline 
                ? 'Онлайн' 
                : userStatus?.lastSeen 
                  ? `был в сети ${new Date(userStatus.lastSeen).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}` 
                  : otherUser?.rank || ''}
          </Text>
        </View>
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton}>
          <Phone size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Info size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {renderHeader()}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {isLoading && chatMessages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          renderItem={({ item }) => (
            <ChatMessage 
              message={item} 
              isCurrentUser={item.senderId === user.id} 
            />
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          inverted={false}
        />
      )}
      
      <View style={styles.inputContainer}>
        {showAttachmentOptions && (
          <View style={styles.attachmentOptions}>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleImagePicker}>
              <Image size={24} color={colors.primary} />
              <Text style={styles.attachmentOptionText}>Фото</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleFilePicker}>
              <Paperclip size={24} color={colors.primary} />
              <Text style={styles.attachmentOptionText}>Файл</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isRecording ? (
          <View style={styles.recordingContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Запись... {formatRecordingTime(recordingDuration)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.stopRecordingButton}
              onPress={handleVoiceRecording}
            >
              <MicOff size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.messageInputContainer}>
            <TouchableOpacity 
              style={styles.attachmentButton}
              onPress={handleAttachmentPress}
            >
              <Paperclip size={20} color={colors.primary} />
            </TouchableOpacity>
            
            <Input
              placeholder="Введите сообщение..."
              value={messageText}
              onChangeText={setMessageText}
              containerStyle={styles.input}
              multiline
            />
            
            {messageText.trim() ? (
              <TouchableOpacity 
                style={styles.sendButton}
                onPress={handleSend}
              >
                <Send size={20} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.voiceButton}
                onPress={handleVoiceRecording}
              >
                <Mic size={20} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
  },
  inputContainer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachmentOptions: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  attachmentOption: {
    alignItems: 'center',
    marginRight: 24,
  },
  attachmentOptionText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  attachmentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.primaryLight,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  stopRecordingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
});