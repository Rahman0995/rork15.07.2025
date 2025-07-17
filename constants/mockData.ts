import { User, Report, ChatMessage, Task } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Иванов А.П.',
    rank: 'Полковник',
    role: 'battalion_commander',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    unit: 'Батальон А',
    email: 'ivanov@mil.ru',
    phone: '+7 (900) 123-45-67',
  },
  {
    id: '2',
    name: 'Петров С.В.',
    rank: 'Майор',
    role: 'company_commander',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=100&auto=format&fit=crop',
    unit: 'Рота Б-1',
    email: 'petrov@mil.ru',
    phone: '+7 (900) 123-45-68',
  },
  {
    id: '3',
    name: 'Сидоров И.К.',
    rank: 'Капитан',
    role: 'officer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
    unit: 'Рота Б-1',
    email: 'sidorov@mil.ru',
    phone: '+7 (900) 123-45-69',
  },
  {
    id: '4',
    name: 'Смирнов Д.А.',
    rank: 'Лейтенант',
    role: 'officer',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
    unit: 'Рота Б-2',
    email: 'smirnov@mil.ru',
    phone: '+7 (900) 123-45-70',
  },
  {
    id: '5',
    name: 'Козлов А.Н.',
    rank: 'Сержант',
    role: 'soldier',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop',
    unit: 'Рота Б-2',
    email: 'kozlov@mil.ru',
    phone: '+7 (900) 123-45-71',
  },
];

export const mockReports: Report[] = [
  {
    id: '1',
    title: 'Отчет о проведении учений',
    content: 'Учения проведены успешно. Все задачи выполнены в срок. Личный состав показал высокий уровень подготовки.',
    authorId: '2',
    createdAt: new Date(2025, 7, 10).toISOString(),
    updatedAt: new Date(2025, 7, 10).toISOString(),
    status: 'approved',
    type: 'text',
    attachments: [],
    unit: 'Рота Б-1',
    priority: 'high',
    approvers: ['1'],
    currentApprover: '1',
    approvals: [
      {
        id: 'app1',
        reportId: '1',
        approverId: '1',
        status: 'approved',
        comment: 'Отличная работа. Учения проведены на высоком уровне.',
        createdAt: new Date(2025, 7, 10, 14, 30).toISOString(),
      }
    ],
    comments: [
      {
        id: 'comm1',
        reportId: '1',
        authorId: '1',
        content: 'Хорошо подготовленный отчет. Все основные моменты освещены.',
        createdAt: new Date(2025, 7, 10, 14, 25).toISOString(),
        isRevision: false,
      }
    ],
    revisions: [
      {
        id: 'rev1',
        reportId: '1',
        version: 1,
        title: 'Отчет о проведении учений',
        content: 'Учения проведены успешно. Все задачи выполнены в срок. Личный состав показал высокий уровень подготовки.',
        attachments: [],
        createdAt: new Date(2025, 7, 10).toISOString(),
        createdBy: '2',
        authorId: '2',
      }
    ],
    currentRevision: 1,
  },
  {
    id: '2',
    title: 'Ежемесячный отчет о состоянии техники',
    content: 'Техника в исправном состоянии. Требуется плановое обслуживание 2 единиц. Все системы функционируют нормально.',
    authorId: '3',
    createdAt: new Date(2025, 7, 8).toISOString(),
    updatedAt: new Date(2025, 7, 8).toISOString(),
    status: 'pending',
    type: 'text',
    attachments: [
      { id: '1', name: 'inventory.xlsx', type: 'file', url: '#' }
    ],
    unit: 'Рота Б-1',
    priority: 'medium',
    approvers: ['1', '2'],
    currentApprover: '2',
    approvals: [],
    comments: [],
    revisions: [
      {
        id: 'rev2',
        reportId: '2',
        version: 1,
        title: 'Ежемесячный отчет о состоянии техники',
        content: 'Техника в исправном состоянии. Требуется плановое обслуживание 2 единиц. Все системы функционируют нормально.',
        attachments: [
          { id: '1', name: 'inventory.xlsx', type: 'file', url: '#' }
        ],
        createdAt: new Date(2025, 7, 8).toISOString(),
        createdBy: '3',
        authorId: '3',
      }
    ],
    currentRevision: 1,
  },
  {
    id: '3',
    title: 'Отчет о проведении стрельб',
    content: 'Стрельбы проведены согласно плану. Результаты в приложении. Все нормативы выполнены.',
    authorId: '4',
    createdAt: new Date(2025, 7, 5).toISOString(),
    updatedAt: new Date(2025, 7, 6).toISOString(),
    status: 'approved',
    type: 'text',
    attachments: [
      { id: '2', name: 'results.pdf', type: 'file', url: '#' },
      { id: '3', name: 'video.mp4', type: 'video', url: '#' }
    ],
    unit: 'Рота Б-2',
    priority: 'high',
    approvers: ['1', '2'],
    currentApprover: '1',
    approvals: [
      {
        id: 'app3',
        reportId: '3',
        approverId: '1',
        status: 'approved',
        comment: 'Стрельбы проведены качественно. Результаты соответствуют нормативам.',
        createdAt: new Date(2025, 7, 6, 16, 0).toISOString(),
      }
    ],
    comments: [
      {
        id: 'comm3',
        reportId: '3',
        authorId: '2',
        content: 'Добавьте информацию о расходе боеприпасов.',
        createdAt: new Date(2025, 7, 5, 15, 30).toISOString(),
        isRevision: true,
      },
      {
        id: 'comm4',
        reportId: '3',
        authorId: '4',
        content: 'Информация о расходе боеприпасов добавлена в приложение.',
        createdAt: new Date(2025, 7, 5, 16, 0).toISOString(),
        isRevision: false,
      }
    ],
    revisions: [
      {
        id: 'rev3_1',
        reportId: '3',
        version: 1,
        title: 'Отчет о проведении стрельб',
        content: 'Стрельбы проведены согласно плану. Результаты в приложении.',
        attachments: [
          { id: '2', name: 'results.pdf', type: 'file', url: '#' }
        ],
        createdAt: new Date(2025, 7, 5).toISOString(),
        createdBy: '4',
        authorId: '4',
      },
      {
        id: 'rev3_2',
        reportId: '3',
        version: 2,
        title: 'Отчет о проведении стрельб',
        content: 'Стрельбы проведены согласно плану. Результаты в приложении. Все нормативы выполнены.',
        attachments: [
          { id: '2', name: 'results.pdf', type: 'file', url: '#' },
          { id: '3', name: 'video.mp4', type: 'video', url: '#' }
        ],
        createdAt: new Date(2025, 7, 5, 16, 30).toISOString(),
        createdBy: '4',
        authorId: '4',
      }
    ],
    currentRevision: 2,
  },
  {
    id: '4',
    title: 'Отчет о состоянии личного состава',
    content: 'Личный состав в полной готовности. Двое военнослужащих на больничном. Требуется дополнительная информация.',
    authorId: '2',
    createdAt: new Date(2025, 7, 1).toISOString(),
    updatedAt: new Date(2025, 7, 2).toISOString(),
    status: 'needs_revision',
    type: 'text',
    attachments: [],
    unit: 'Рота Б-1',
    priority: 'medium',
    approvers: ['1'],
    currentApprover: '1',
    approvals: [
      {
        id: 'app4',
        reportId: '4',
        approverId: '1',
        status: 'needs_revision',
        comment: 'Необходимо добавить подробную информацию о причинах нахождения военнослужащих на больничном и сроках их возвращения к службе.',
        createdAt: new Date(2025, 7, 2, 10, 0).toISOString(),
      }
    ],
    comments: [
      {
        id: 'comm5',
        reportId: '4',
        authorId: '1',
        content: 'Укажите диагнозы и предполагаемые сроки выздоровления.',
        createdAt: new Date(2025, 7, 2, 9, 45).toISOString(),
        isRevision: true,
      }
    ],
    revisions: [
      {
        id: 'rev4',
        reportId: '4',
        version: 1,
        title: 'Отчет о состоянии личного состава',
        content: 'Личный состав в полной готовности. Двое военнослужащих на больничном. Требуется дополнительная информация.',
        attachments: [],
        createdAt: new Date(2025, 7, 1).toISOString(),
        createdBy: '2',
        authorId: '2',
      }
    ],
    currentRevision: 1,
  },
  {
    id: '5',
    title: 'Отчет о проведении строевого смотра',
    content: 'Строевой смотр проведен. Замечания устранены. Личный состав показал хорошую строевую подготовку.',
    authorId: '5',
    createdAt: new Date(2025, 6, 28).toISOString(),
    updatedAt: new Date(2025, 6, 29).toISOString(),
    status: 'approved',
    type: 'text',
    attachments: [],
    unit: 'Рота Б-2',
    priority: 'low',
    approvers: ['2'],
    currentApprover: '2',
    approvals: [
      {
        id: 'app5',
        reportId: '5',
        approverId: '2',
        status: 'approved',
        createdAt: new Date(2025, 6, 29, 11, 0).toISOString(),
      }
    ],
    comments: [],
    revisions: [
      {
        id: 'rev5',
        reportId: '5',
        version: 1,
        title: 'Отчет о проведении строевого смотра',
        content: 'Строевой смотр проведен. Замечания устранены. Личный состав показал хорошую строевую подготовку.',
        attachments: [],
        createdAt: new Date(2025, 6, 28).toISOString(),
        createdBy: '5',
        authorId: '5',
      }
    ],
    currentRevision: 1,
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Подготовить отчет о состоянии техники',
    description: 'Провести инвентаризацию и составить отчет о состоянии техники',
    assignedTo: '3',
    createdBy: '2',
    dueDate: new Date(2025, 7, 15).toISOString(),
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(2025, 7, 5).toISOString(),
    updatedAt: new Date(2025, 7, 5).toISOString(),
  },
  {
    id: '2',
    title: 'Организовать учения',
    description: 'Спланировать и провести тактические учения с личным составом',
    assignedTo: '2',
    createdBy: '1',
    dueDate: new Date(2025, 7, 20).toISOString(),
    status: 'pending',
    priority: 'high',
    createdAt: new Date(2025, 7, 1).toISOString(),
    updatedAt: new Date(2025, 7, 1).toISOString(),
  },
  {
    id: '3',
    title: 'Проверить состояние казарм',
    description: 'Провести проверку санитарного состояния казарм',
    assignedTo: '4',
    createdBy: '2',
    dueDate: new Date(2025, 7, 12).toISOString(),
    status: 'completed',
    priority: 'medium',
    createdAt: new Date(2025, 7, 8).toISOString(),
    updatedAt: new Date(2025, 7, 10).toISOString(),
    completedAt: new Date(2025, 7, 10).toISOString(),
  },
  {
    id: '4',
    title: 'Подготовить план занятий',
    description: 'Разработать план занятий на следующий месяц',
    assignedTo: '3',
    createdBy: '2',
    dueDate: new Date(2025, 7, 25).toISOString(),
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(2025, 7, 7).toISOString(),
    updatedAt: new Date(2025, 7, 7).toISOString(),
  },
  {
    id: '5',
    title: 'Провести инструктаж по безопасности',
    description: 'Провести инструктаж по технике безопасности с личным составом',
    assignedTo: '5',
    createdBy: '4',
    dueDate: new Date(2025, 7, 11).toISOString(),
    status: 'in_progress',
    priority: 'high',
    createdAt: new Date(2025, 7, 9).toISOString(),
    updatedAt: new Date(2025, 7, 9).toISOString(),
  },
];

export const mockChatMessages: Record<string, ChatMessage[]> = {
  'chat_1_2': [
    {
      id: '1',
      senderId: '1',
      text: 'Добрый день, майор. Как продвигается подготовка к учениям?',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 10, 15).toISOString(),
      read: true,
    },
    {
      id: '2',
      senderId: '2',
      text: 'Здравия желаю, товарищ полковник! Подготовка идет по плану. Завтра представлю полный отчет.',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 10, 20).toISOString(),
      read: true,
    },
    {
      id: '3',
      senderId: '2',
      type: 'image',
      attachment: {
        id: 'img1',
        name: 'техника.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
        size: 245760,
      },
      createdAt: new Date(2025, 7, 9, 10, 22).toISOString(),
      read: true,
    },
    {
      id: '4',
      senderId: '1',
      text: 'Отлично. Обратите особое внимание на готовность техники.',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 10, 25).toISOString(),
      read: true,
    },
    {
      id: '5',
      senderId: '2',
      type: 'voice',
      text: 'Так точно! Техника проверена и готова к использованию.',
      attachment: {
        id: 'voice1',
        name: 'voice_message.m4a',
        type: 'voice',
        url: 'mock://voice1.m4a',
        duration: 15,
      },
      createdAt: new Date(2025, 7, 9, 10, 28).toISOString(),
      read: true,
    },
    {
      id: '6',
      senderId: '1',
      type: 'voice',
      text: 'Отлично. Продолжайте в том же духе.',
      attachment: {
        id: 'voice2',
        name: 'voice_response.m4a',
        type: 'voice',
        url: 'mock://voice2.m4a',
        duration: 8,
      },
      createdAt: new Date(2025, 7, 9, 10, 30).toISOString(),
      read: false,
    },
    {
      id: '7',
      senderId: '2',
      text: 'Понял, товарищ полковник!',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 10, 32).toISOString(),
      read: false,
    },
  ],
  'chat_2_3': [
    {
      id: '1',
      senderId: '2',
      text: 'Капитан, подготовьте отчет о состоянии техники к завтрашнему дню.',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 11, 0).toISOString(),
      read: true,
    },
    {
      id: '2',
      senderId: '3',
      text: 'Есть, товарищ майор! Отчет будет готов к 18:00.',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 11, 5).toISOString(),
      read: true,
    },
    {
      id: '3',
      senderId: '3',
      type: 'file',
      attachment: {
        id: 'file1',
        name: 'отчет_техника.pdf',
        type: 'file',
        url: 'mock://report.pdf',
        size: 1024000,
      },
      createdAt: new Date(2025, 7, 9, 17, 45).toISOString(),
      read: false,
    },
  ],
  'group_battalion_a': [
    {
      id: '1',
      senderId: '1',
      text: 'Всем командирам рот: завтра в 09:00 совещание по подготовке к учениям.',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 15, 0).toISOString(),
      read: true,
    },
    {
      id: '2',
      senderId: '2',
      text: 'Понял, буду присутствовать.',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 15, 5).toISOString(),
      read: true,
    },
    {
      id: '3',
      senderId: '4',
      text: 'Так точно, товарищ полковник!',
      type: 'text',
      createdAt: new Date(2025, 7, 9, 15, 10).toISOString(),
      read: true,
    },
    {
      id: '4',
      senderId: '2',
      type: 'image',
      attachment: {
        id: 'img2',
        name: 'план_учений.jpg',
        type: 'image',
        url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
        size: 512000,
      },
      text: 'План учений готов',
      createdAt: new Date(2025, 7, 9, 16, 30).toISOString(),
      read: false,
    },
  ],
};

// Initialize some users as online - moved to chatStore to avoid circular dependency

export const mockChats = [
  {
    id: 'chat_1_2',
    participants: ['1', '2'],
    lastMessage: mockChatMessages['chat_1_2'][mockChatMessages['chat_1_2'].length - 1],
    unreadCount: 1,
    isGroup: false,
  },
  {
    id: 'chat_2_3',
    participants: ['2', '3'],
    lastMessage: mockChatMessages['chat_2_3'][mockChatMessages['chat_2_3'].length - 1],
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: 'group_battalion_a',
    participants: ['1', '2', '4'],
    name: 'Батальон А',
    lastMessage: mockChatMessages['group_battalion_a'][mockChatMessages['group_battalion_a'].length - 1],
    unreadCount: 0,
    isGroup: true,
  },
];

export const getUser = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getReport = (id: string): Report | undefined => {
  return mockReports.find(report => report.id === id);
};

export const getTask = (id: string): Task | undefined => {
  return mockTasks.find(task => task.id === id);
};

export const getUserTasks = (userId: string): Task[] => {
  return mockTasks.filter(task => task.assignedTo === userId);
};

export const getUserReports = (userId: string): Report[] => {
  return mockReports.filter(report => report.authorId === userId);
};

export const getUnitReports = (unit: string): Report[] => {
  return mockReports.filter(report => report.unit === unit);
};

export const getUnitUsers = (unit: string): User[] => {
  return mockUsers.filter(user => user.unit === unit);
};

export const getChatMessages = (chatId: string): ChatMessage[] => {
  return mockChatMessages[chatId] || [];
};

export const getUserChats = (userId: string) => {
  return mockChats.filter(chat => 
    chat.participants.includes(userId) || 
    (chat.isGroup && chat.participants.includes(userId))
  );
};