import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Chat } from '@/types';
import { Avatar } from './Avatar';
import { formatChatDate } from '@/utils/dateUtils';
import { useTheme } from '@/constants/theme';
import { getUser } from '@/constants/mockData';
import { useChatStore } from '@/store/chatStore';

interface ChatListItemProps {
  chat: Chat;
  currentUserId: string;
  onPress: (chat: Chat) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({ 
  chat, 
  currentUserId,
  onPress 
}) => {
  const { getUserStatus } = useChatStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  const otherParticipantId = chat.isGroup 
    ? null 
    : chat.participants.find(id => id !== currentUserId);
  
  const otherUser = otherParticipantId ? getUser(otherParticipantId) : null;
  const displayName = chat.isGroup ? (chat.name || 'Групповой чат') : (otherUser?.name || 'Неизвестный');
  const userStatus = otherParticipantId ? getUserStatus(otherParticipantId) : null;
  
  // For group chats, use the first participant's avatar as a placeholder
  const avatarUri = chat.isGroup 
    ? undefined 
    : otherUser?.avatar;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(chat)}
      activeOpacity={0.7}
    >
      <Avatar 
        uri={avatarUri} 
        name={displayName} 
        size={50} 
        showBadge={!chat.isGroup}
        online={userStatus?.isOnline || false}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          {chat.lastMessage && (
            <Text style={styles.time}>
              {formatChatDate(chat.lastMessage.createdAt)}
            </Text>
          )}
        </View>
        
        {chat.lastMessage ? (
          <View style={styles.messageContainer}>
            <Text style={styles.message} numberOfLines={1}>
              {chat.lastMessage.senderId === currentUserId ? 'Вы: ' : ''}
              {chat.lastMessage.type === 'text' 
                ? chat.lastMessage.text 
                : chat.lastMessage.type === 'image' 
                  ? '📷 Фото'
                  : chat.lastMessage.type === 'file'
                    ? '📁 Файл'
                    : chat.lastMessage.type === 'voice'
                      ? '🎤 Голосовое сообщение'
                      : chat.lastMessage.text || 'Сообщение'}
            </Text>
            
            {chat.unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {chat.unreadCount}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text style={styles.noMessages}>Нет сообщений</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  noMessages: {
    fontSize: 14,
    color: colors.inactive,
    fontStyle: 'italic',
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
});