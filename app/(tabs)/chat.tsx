import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { ChatListItem } from '@/components/ChatListItem';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTheme } from '@/constants/theme';
import { Search, Users } from 'lucide-react-native';
import { Chat } from '@/types';

type ListItem = 
  | { type: 'header'; id: string; title: string }
  | (Chat & { type: 'chat' });

export default function ChatScreen() {
  const router = useRouter();
  const { chats, fetchChats, isLoading, setCurrentChat } = useChatStore();
  const { user, isAuthenticated } = useAuthStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  useEffect(() => {
    if (user && isAuthenticated) {
      fetchChats(user.id);
    }
  }, [user, isAuthenticated]);
  
  const navigateToChat = (chat: Chat) => {
    setCurrentChat(chat.id);
    router.push(`/chat/${chat.id}`);
  };
  
  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <Users size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    </View>
  );
  
  // Group chats into direct messages and group chats
  const directChats = chats.filter(chat => !chat.isGroup);
  const groupChats = chats.filter(chat => chat.isGroup);
  
  const listData: ListItem[] = [
    { type: 'header', id: 'direct-header', title: 'Личные сообщения' },
    ...directChats.map(chat => ({ ...chat, type: 'chat' as const })),
    { type: 'header', id: 'group-header', title: 'Групповые чаты' },
    ...groupChats.map(chat => ({ ...chat, type: 'chat' as const })),
  ];

  if (!isAuthenticated || !user) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Input
            placeholder="Поиск чатов..."
            containerStyle={styles.searchInput}
          />
          <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
        </View>
        
        <Button
          title="Новый"
          onPress={() => {}}
          size="small"
        />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : chats.length > 0 ? (
        <FlatList
          data={listData}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return renderSectionHeader(item.title);
            } else {
              return (
                <ChatListItem 
                  key={item.id}
                  chat={item} 
                  currentUserId={user.id} 
                  onPress={navigateToChat} 
                />
              );
            }
          }}
          keyExtractor={item => 
            item.type === 'header' ? item.id : item.id
          }
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => user && fetchChats(user.id)}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>У вас пока нет активных чатов</Text>
          <Button
            title="Начать новый чат"
            onPress={() => {}}
            style={styles.createButton}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
    position: 'relative',
  },
  searchInput: {
    marginBottom: 0,
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  sectionHeader: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    marginTop: 12,
  },
});