// Mock data for the application
export const mockChats = [
  {
    id: 'chat_1_2',
    participants: ['1', '2'],
    lastMessage: {
      id: '2',
      senderId: '2',
      text: 'Everything is on track. Will have the report ready tomorrow.',
      type: 'text' as const,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      read: false,
    },
    unreadCount: 1,
    isGroup: false,
  },
];

export const mockChatMessages: Record<string, any[]> = {
  'chat_1_2': [
    {
      id: '1',
      senderId: '1',
      text: 'Hello, how is the preparation going?',
      type: 'text',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      read: true,
    },
    {
      id: '2',
      senderId: '2',
      text: 'Everything is on track. Will have the report ready tomorrow.',
      type: 'text',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      read: false,
    },
  ],
};